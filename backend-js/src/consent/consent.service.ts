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
}
