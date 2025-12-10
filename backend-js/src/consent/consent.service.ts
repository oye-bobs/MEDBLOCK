import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsentRecord, ConsentStatus, Patient, Practitioner } from '../database/entities';

@Injectable()
export class ConsentService {
    private readonly logger = new Logger(ConsentService.name);

    constructor(
        @InjectRepository(ConsentRecord)
        private consentRepo: Repository<ConsentRecord>,
        @InjectRepository(Patient)
        private patientRepo: Repository<Patient>,
        @InjectRepository(Practitioner)
        private practitionerRepo: Repository<Practitioner>,
    ) { }

    async grantConsent(
        patientDid: string,
        providerDid: string,
        scope: string[] = ['all'],
        durationHours: number = 72,
    ): Promise<ConsentRecord> {
        // 1. Verify Patient
        const patient = await this.patientRepo.findOne({ where: { did: patientDid } });
        if (!patient) throw new NotFoundException('Patient not found');

        // 2. Verify Provider
        const provider = await this.practitionerRepo.findOne({ where: { did: providerDid } });
        if (!provider) throw new NotFoundException('Provider not found');

        // 3. Calculate Expiration
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + durationHours);

        // 4. Create Consent Record
        // TODO: Deploy Plutus smart contract and get address
        const mockContractAddress = `addr_test1_consent_${Date.now()}`;
        const mockTxId = `tx_consent_${Date.now()}`;

        const consent = this.consentRepo.create({
            patient,
            practitioner: provider,
            status: ConsentStatus.ACTIVE,
            scope,
            expiresAt,
            smartContractAddress: mockContractAddress,
            consentTxId: mockTxId,
        });

        const saved = await this.consentRepo.save(consent);
        this.logger.log(`Consent granted: ${patientDid} -> ${providerDid}`);

        return saved;
    }

    async revokeConsent(consentId: string, userDid: string): Promise<ConsentRecord> {
        const consent = await this.consentRepo.findOne({
            where: { id: consentId },
            relations: ['patient'],
        });

        if (!consent) throw new NotFoundException('Consent record not found');

        // Only patient can revoke
        if (consent.patient.did !== userDid) {
            throw new ForbiddenException('Only the patient can revoke consent');
        }

        consent.status = ConsentStatus.REVOKED;
        consent.revokedAt = new Date();

        // TODO: Update smart contract

        return this.consentRepo.save(consent);
    }

    async getActiveConsents(userDid: string): Promise<ConsentRecord[]> {
        // Check if user is patient
        const patient = await this.patientRepo.findOne({ where: { did: userDid } });
        if (patient) {
            return this.consentRepo.find({
                where: {
                    patient: { id: patient.id },
                    status: ConsentStatus.ACTIVE,
                },
                relations: ['practitioner'],
            });
        }

        // Check if user is provider
        const provider = await this.practitionerRepo.findOne({ where: { did: userDid } });
        if (provider) {
            return this.consentRepo.find({
                where: {
                    practitioner: { id: provider.id },
                    status: ConsentStatus.ACTIVE,
                },
                relations: ['patient'],
            });
        }

        return [];
    }
    async requestConsent(
        providerDid: string,
        patientDid: string,
        purpose: string,
        scope: string[] = ['all'],
    ): Promise<ConsentRecord> {
        // 1. Verify Provider
        const provider = await this.practitionerRepo.findOne({ where: { did: providerDid } });
        if (!provider) throw new NotFoundException('Provider not found');

        // 2. Verify Patient
        const patient = await this.patientRepo.findOne({ where: { did: patientDid } });
        // In a real scenario, we might want to allow requesting even if patient not yet registered locally, 
        // but for now let's assume patient exists.
        if (!patient) throw new NotFoundException('Patient not found');

        // 3. Check if request already exists
        const existing = await this.consentRepo.findOne({
            where: {
                patient: { id: patient.id },
                practitioner: { id: provider.id },
                status: ConsentStatus.PENDING,
            }
        });

        if (existing) {
            // Update existing request
            existing.scope = scope;
            existing.updatedAt = new Date();
            return this.consentRepo.save(existing);
        }

        // 4. Create Pending Consent
        const consent = this.consentRepo.create({
            patient,
            practitioner: provider,
            status: ConsentStatus.PENDING,
            scope,
            // Temp placeholders for pending
            smartContractAddress: 'PENDING',
            consentTxId: `req_${Date.now()}`,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days for request to be acted upon? 
            // Or maybe expiresAt is relevant only after approval. Let's set a default validity for the request itself.
        });

        const saved = await this.consentRepo.save(consent);
        this.logger.log(`Consent requested: ${providerDid} -> ${patientDid}`);
        return saved;
    }

    async getPendingConsents(userDid: string): Promise<ConsentRecord[]> {
        const patient = await this.patientRepo.findOne({ where: { did: userDid } });
        if (patient) {
            return this.consentRepo.find({
                where: {
                    patient: { id: patient.id },
                    status: ConsentStatus.PENDING,
                },
                relations: ['practitioner'],
                order: { createdAt: 'DESC' }
            });
        }

        const provider = await this.practitionerRepo.findOne({ where: { did: userDid } });
        if (provider) {
            return this.consentRepo.find({
                where: {
                    practitioner: { id: provider.id },
                    status: ConsentStatus.PENDING,
                },
                relations: ['patient'],
                order: { createdAt: 'DESC' }
            });
        }

        return [];
    }

    async approveConsent(consentId: string, patientDid: string): Promise<ConsentRecord> {
        const consent = await this.consentRepo.findOne({
            where: { id: consentId },
            relations: ['patient', 'practitioner']
        });

        if (!consent) throw new NotFoundException('Consent request not found');
        if (consent.patient.did !== patientDid) throw new ForbiddenException('Not authorized to approve this request');
        if (consent.status !== ConsentStatus.PENDING) throw new BadRequestException('Consent is not in pending state');

        // Transition to ACTIVE
        consent.status = ConsentStatus.ACTIVE;
        consent.grantedAt = new Date();
        // Set actual expiration from now
        const durationHours = 72; // Default or from request? Let's use default 72h for now or we could store requested duration.
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + durationHours);
        consent.expiresAt = expiresAt;

        // Mock Blockchain deployment for active consent
        consent.smartContractAddress = `addr_test1_consent_${Date.now()}`;
        consent.consentTxId = `tx_consent_${Date.now()}`;

        return this.consentRepo.save(consent);
    }

    async rejectConsent(consentId: string, patientDid: string): Promise<ConsentRecord> {
        const consent = await this.consentRepo.findOne({
            where: { id: consentId },
            relations: ['patient']
        });

        if (!consent) throw new NotFoundException('Consent request not found');
        if (consent.patient.did !== patientDid) throw new ForbiddenException('Not authorized');

        // We can either delete it or mark as rejected/revoked.
        // Let's mark Revoked/Rejected to keep history if needed, or just delete. 
        // ConsentStatus has REVOKED. Let's use that or add REJECTED. 
        // For simplicity, let's just delete or use REVOKED.
        // Step 101 shows REVOKED but not REJECTED. Let's use REVOKED.
        consent.status = ConsentStatus.REVOKED;
        return this.consentRepo.save(consent);
    }
}
