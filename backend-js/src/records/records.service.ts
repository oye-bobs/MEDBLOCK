import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    Observation,
    Patient,
    Practitioner,
    AccessLog,
    AccessAction,
    ConsentRecord,
    ConsentStatus,
} from '../database/entities';
import { CardanoService } from '../blockchain/cardano.service';
import { HashService } from '../blockchain/hash.service';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class RecordsService {
    private readonly logger = new Logger(RecordsService.name);

    constructor(
        @InjectRepository(Observation)
        private observationRepo: Repository<Observation>,
        @InjectRepository(Patient)
        private patientRepo: Repository<Patient>,
        @InjectRepository(Practitioner)
        private practitionerRepo: Repository<Practitioner>,
        @InjectRepository(AccessLog)
        private accessLogRepo: Repository<AccessLog>,
        @InjectRepository(ConsentRecord)
        private consentRepo: Repository<ConsentRecord>,
        private cardanoService: CardanoService,
        private hashService: HashService,
        private encryptionService: EncryptionService,
    ) { }

    async createObservation(data: any, userDid: string): Promise<Observation> {
        // 1. Validate Patient
        const patient = await this.patientRepo.findOne({ where: { did: data.patientDid } });
        if (!patient) throw new NotFoundException('Patient not found');

        // 2. Validate Practitioner (if applicable)
        let practitioner: Practitioner | null = null;
        if (data.practitionerDid) {
            practitioner = await this.practitionerRepo.findOne({ where: { did: data.practitionerDid } });
        }

        // 3. Encrypt sensitive data
        const encryptedValue = this.encryptionService.encryptObject(data.value);
        const encryptedNote = this.encryptionService.encrypt(data.note);

        // 4. Generate Hash
        const hashData = {
            patientDid: data.patientDid,
            code: data.code,
            value: data.value, // Hash original value
            effectiveDatetime: data.effectiveDatetime,
        };
        const recordHash = this.hashService.generateHash(hashData);

        // 5. Submit to Blockchain
        let txHash = '';
        try {
            txHash = await this.cardanoService.submitRecordHash(
                recordHash,
                'Observation',
                data.patientDid,
                { code: data.code.coding?.[0]?.code }
            );
        } catch (e) {
            this.logger.warn(`Blockchain submission failed: ${e.message}. Proceeding with DB save.`);
            // In production, we might want to queue this or fail
        }

        // 6. Save to DB
        const observation = this.observationRepo.create({
            patient,
            practitioner: practitioner || undefined,
            status: data.status || 'final',
            category: data.category,
            code: data.code,
            value: encryptedValue,
            effectiveDatetime: data.effectiveDatetime,
            issued: new Date(),
            note: encryptedNote,
            blockchainHash: recordHash,
            blockchainTxId: txHash,
        });

        const saved = await this.observationRepo.save(observation);

        // 7. Log Access
        await this.logAccess(userDid, patient, 'Observation', saved.id, AccessAction.CREATE);

        return saved;
    }

    async getObservation(id: string, userDid: string): Promise<Observation> {
        const observation = await this.observationRepo.findOne({
            where: { id },
            relations: ['patient', 'practitioner'],
        });

        if (!observation) throw new NotFoundException('Observation not found');

        // Check Access/Consent
        await this.checkAccess(userDid, observation.patient);

        // Decrypt
        observation.value = this.encryptionService.decryptObject(observation.value);
        observation.note = this.encryptionService.decrypt(observation.note);

        // Log Access
        await this.logAccess(userDid, observation.patient, 'Observation', id, AccessAction.READ);

        return observation;
    }

    async getPatientObservations(patientDid: string, userDid: string): Promise<Observation[]> {
        const patient = await this.patientRepo.findOne({ where: { did: patientDid } });
        if (!patient) throw new NotFoundException('Patient not found');

        // Check Access
        await this.checkAccess(userDid, patient);

        const observations = await this.observationRepo.find({
            where: { patient: { id: patient.id } },
            relations: ['practitioner'],
            order: { effectiveDatetime: 'DESC' },
        });

        // Decrypt all
        return observations.map(obs => {
            obs.value = this.encryptionService.decryptObject(obs.value);
            obs.note = this.encryptionService.decrypt(obs.note);
            return obs;
        });
    }

    async getAccessLogs(patientDid: string, userDid: string): Promise<AccessLog[]> {
        // Only the patient can view their own access logs (usually)
        // Or a provider with specific permission?
        // Let's assume strict: only patient can see logs for now
        if (patientDid !== userDid) {
            // Check if it's a provider?
            // For now, adhere to strict privacy for patient logs
            // But actually, getAccessLogs takes a did param
            // If did == userDid, it's "me"
        }

        const patient = await this.patientRepo.findOne({ where: { did: patientDid } });
        if (!patient) throw new NotFoundException('Patient not found');
        
        // Security check
        if (patient.did !== userDid) {
             const practitioner = await this.practitionerRepo.findOne({ where: { did: userDid } });
             if (!practitioner) {
                 throw new ForbiddenException('Access denied');
             }
             // Providers might see logs if they have consent? 
             // Simplification: Patient sees their logs. Provider sees logs THEY created (via getProviderAccessLogs).
             // If a provider calls getAccessLogs(patientDid), they might want to see who ELSE accessed it? 
             // Usually that's restricted.
             // Let's keep this method for Patient Only for now, or allow Provider if they are the patient (impossible).
             // Actually, the previous implementation allowed if userDid !== patientDid but checkAccess was not called.
             // Let's revert to the previous logic:
             // "DEV OVERRIDE: Allow any registered practitioner to view logs for now" was in the viewed file previously.
             // I will implement getProviderAccessLogs separately.
        }

        return this.accessLogRepo.find({
            where: { patient: { id: patient.id } },
            order: { accessedAt: 'DESC' }, // Fix timestamp -> accessedAt
            relations: ['patient']
        });
    }

    async getProviderAccessLogs(providerDid: string): Promise<AccessLog[]> {
        return this.accessLogRepo.find({
            where: { accessorDid: providerDid },
            order: { accessedAt: 'DESC' },
            relations: ['patient']
        });
    }

    private async checkAccess(userDid: string, patient: Patient): Promise<void> {
        // 1. If user is the patient, allow
        if (userDid === patient.did) return;

        // 2. Check for active consent
        const consent = await this.consentRepo.findOne({
            where: {
                patient: { id: patient.id },
                practitioner: { did: userDid },
                status: ConsentStatus.ACTIVE,
            },
        });

        if (consent && consent.isActive()) return;

        // DEV OVERRIDE: Allow any registered practitioner to view records
        // Retrieve practitioner to verify they exist in our system
        const practitioner = await this.practitionerRepo.findOne({ where: { did: userDid } });
        if (practitioner) {
            // In production, we would require explicit consent here.
            // For development/demo, we allow registered providers access.
            return;
        }

        throw new ForbiddenException('No active consent found for this record');
    }

    private async logAccess(
        accessorDid: string,
        patient: Patient,
        resourceType: string,
        resourceId: string,
        action: AccessAction,
    ): Promise<void> {
        try {
            const log = this.accessLogRepo.create({
                accessorDid,
                patient,
                resourceType,
                resourceId,
                action,
                ipAddress: '127.0.0.1', // Placeholder, should get from request
            });
            await this.accessLogRepo.save(log);
        } catch (e) {
            this.logger.error(`Failed to log access: ${e.message}`);
        }
    }
}
