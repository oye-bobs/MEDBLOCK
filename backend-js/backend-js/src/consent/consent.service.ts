import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConsentRecord,
  ConsentStatus,
  Patient,
  Practitioner,
} from '../database/entities';
import { NotificationsService } from '../notifications/notifications.service';

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
    private notificationsService: NotificationsService,
  ) {}

  async grantConsent(
    patientDid: string,
    providerDid: string,
    scope: string[] = ['all'],
    durationHours: number = 72,
  ): Promise<ConsentRecord> {
    if (!providerDid) {
      throw new BadRequestException('Provider DID is required');
    }

    // 1. Verify Patient
    const patient = await this.patientRepo.findOne({
      where: { did: patientDid },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    // 2. Verify Provider
    const provider = await this.practitionerRepo.findOne({
      where: { did: providerDid },
    });
    if (!provider) throw new NotFoundException('Provider not found');

    // 3. Create PENDING Consent Request
    // Instead of directly creating ACTIVE consent, we now create a PENDING request
    // initiated by the patient. The provider must approve it.

    const existing = await this.consentRepo.findOne({
      where: {
        patient: { id: patient.id },
        practitioner: { id: provider.id },
        status: ConsentStatus.PENDING,
      },
    });

    if (existing) {
      // Update existing request
      existing.scope = scope;
      existing.initiatedBy = patientDid;
      existing.updatedAt = new Date();
      return this.consentRepo.save(existing);
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + durationHours);

    const consent = this.consentRepo.create({
      patient,
      practitioner: provider,
      status: ConsentStatus.PENDING, // Changed to PENDING
      scope,
      initiatedBy: patientDid, // Mark as initiated by patient
      expiresAt,
      smartContractAddress: 'PENDING',
      consentTxId: `req_${Date.now()}`,
    });

    const saved = await this.consentRepo.save(consent);
    this.logger.log(
      `Consent requested by patient: ${patientDid} -> ${provider.did}`,
    );

    // Notify provider about the incoming request
    try {
      await this.notificationsService.notifyPatientInteroperabilityRequest(
        provider.did, // Use confirmed provider DID
        patientDid,
        saved.id,
        patient.name?.[0]?.text || 'Patient',
      );
    } catch (error) {
      this.logger.error(`Failed to notify provider: ${error.message}`);
    }

    return saved;
  }

  async revokeConsent(
    consentId: string,
    userDid: string,
  ): Promise<ConsentRecord> {
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
      // Patients can see all their consents
      return this.consentRepo.find({
        where: {
          patient: { id: patient.id },
          status: ConsentStatus.ACTIVE,
        },
        relations: ['practitioner'],
        order: { createdAt: 'DESC' },
      });
    }

    // Check if user is provider
    const provider = await this.practitionerRepo.findOne({
      where: { did: userDid },
    });
    if (provider) {
      // Providers can only see consents where they are the practitioner
      return this.consentRepo.find({
        where: {
          practitioner: { id: provider.id },
          status: ConsentStatus.ACTIVE,
        },
        relations: ['patient'],
        order: { createdAt: 'DESC' },
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
    const provider = await this.practitionerRepo.findOne({
      where: { did: providerDid },
    });
    if (!provider) throw new NotFoundException('Provider not found');

    // 2. Verify Patient
    const patient = await this.patientRepo.findOne({
      where: { did: patientDid },
    });
    // In a real scenario, we might want to allow requesting even if patient not yet registered locally,
    // but for now let's assume patient exists.
    if (!patient) throw new NotFoundException('Patient not found');

    // 3. Check if request already exists
    const existing = await this.consentRepo.findOne({
      where: {
        patient: { id: patient.id },
        practitioner: { id: provider.id },
        status: ConsentStatus.PENDING,
      },
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
      initiatedBy: providerDid, // Mark as initiated by provider
      // Temp placeholders for pending
      smartContractAddress: 'PENDING',
      consentTxId: `req_${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days for request to be acted upon?
      // Or maybe expiresAt is relevant only after approval. Let's set a default validity for the request itself.
    });

    const saved = await this.consentRepo.save(consent);
    this.logger.log(`Consent requested: ${providerDid} -> ${patientDid}`);

    // Send notification to patient
    try {
      await this.notificationsService.notifyConsentRequest(
        patientDid,
        providerDid,
        saved.id,
        provider.name?.[0]?.text,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send consent request notification: ${error.message}`,
      );
    }

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
        order: { createdAt: 'DESC' },
      });
    }

    const provider = await this.practitionerRepo.findOne({
      where: { did: userDid },
    });
    if (provider) {
      return this.consentRepo.find({
        where: {
          practitioner: { id: provider.id },
          status: ConsentStatus.PENDING,
        },
        relations: ['patient'],
        order: { createdAt: 'DESC' },
      });
    }

    return [];
  }

  async approveConsent(
    consentId: string,
    userDid: string,
  ): Promise<ConsentRecord> {
    const consent = await this.consentRepo.findOne({
      where: { id: consentId },
      relations: ['patient', 'practitioner'],
    });

    if (!consent) throw new NotFoundException('Consent request not found');

    // Security check: The user approving must NOT be the one who initiated it
    if (consent.initiatedBy === userDid) {
      throw new ForbiddenException('You cannot approve your own request');
    }

    // Verify the user is either the patient or the provider involved
    const isPatient = consent.patient.did === userDid;
    const isProvider = consent.practitioner.did === userDid;

    if (!isPatient && !isProvider) {
      throw new ForbiddenException('Not authorized to approve this request');
    }
    if (consent.status !== ConsentStatus.PENDING)
      throw new BadRequestException('Consent is not in pending state');

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

    const updated = await this.consentRepo.save(consent);

    // Notify the initiator
    const targetDid = consent.initiatedBy;
    if (targetDid) {
      const approverName = isPatient
        ? consent.patient.name?.[0]?.text
        : consent.practitioner.name?.[0]?.text;
      try {
        if (isProvider) {
          // Provider approved Patient's request -> Notify Patient
          await this.notificationsService.notifyProviderInteroperabilityApproval(
            targetDid, // patient
            userDid, // provider
            consentId,
            approverName,
          );
        } else {
          // Patient approved Provider's request -> Notify Provider (existing flow)
          await this.notificationsService.notifyConsentApproved(
            targetDid, // provider
            userDid, // patient
            consentId,
            approverName,
          );
        }
      } catch (e) {
        this.logger.error(`Failed to notify initiator: ${e.message}`);
      }
    }

    return updated;
  }

  async rejectConsent(
    consentId: string,
    userDid: string,
  ): Promise<ConsentRecord> {
    const consent = await this.consentRepo.findOne({
      where: { id: consentId },
      relations: ['patient', 'practitioner'],
    });

    if (!consent) throw new NotFoundException('Consent request not found');

    const isPatient = consent.patient.did === userDid;
    const isProvider = consent.practitioner.did === userDid;

    if (!isPatient && !isProvider) {
      throw new ForbiddenException('Not authorized');
    }

    // We can either delete it or mark as rejected/revoked.
    // Let's mark Revoked/Rejected to keep history if needed, or just delete.
    // ConsentStatus has REVOKED. Let's use that or add REJECTED.
    // For simplicity, let's just delete or use REVOKED.
    // ConsentStatus has REVOKED but not REJECTED. Let's use REVOKED.

    consent.status = ConsentStatus.REVOKED;
    const updated = await this.consentRepo.save(consent);

    // Notify the initiator that their request was rejected/revoked
    const targetDid = consent.initiatedBy;
    if (targetDid) {
      const rejectorName = isPatient
        ? consent.patient.name?.[0]?.text
        : consent.practitioner.name?.[0]?.text;
      try {
        if (isProvider) {
          // Provider rejected Patient's request -> Notify Patient
          // We can reuse notifyConsentRejected but technically it says "A patient has rejected..."
          // We might need a generic "RequestRejected" or just update the message dynamically in service
          // For now reusing with caveat or better: assume notifyConsentRejected is generic enough if we pass correct name

          // Actually, let's just make sure the message in notifyConsentRejected is generic or we add a new one.
          // Access Request Rejected: "X has rejected your access request."
          await this.notificationsService.notifyConsentRejected(
            targetDid, // patient
            userDid, // provider
            consentId,
            rejectorName,
          );
        } else {
          await this.notificationsService.notifyConsentRejected(
            targetDid, // provider
            userDid, // patient
            consentId,
            rejectorName,
          );
        }
      } catch (error) {
        this.logger.error(
          `Failed to send consent rejected notification: ${error.message}`,
        );
      }
    }

    return updated;
  }

  async getAllConsents(userDid: string): Promise<ConsentRecord[]> {
    // Check if user is patient
    const patient = await this.patientRepo.findOne({ where: { did: userDid } });
    if (patient) {
      // Patients can see all their consents (active, pending, revoked)
      return this.consentRepo.find({
        where: {
          patient: { id: patient.id },
        },
        relations: ['practitioner'],
        order: { createdAt: 'DESC' },
      });
    }

    // Check if user is provider
    const provider = await this.practitionerRepo.findOne({
      where: { did: userDid },
    });
    if (provider) {
      // Providers can only see consents where they are the practitioner
      return this.consentRepo.find({
        where: {
          practitioner: { id: provider.id },
        },
        relations: ['patient'],
        order: { createdAt: 'DESC' },
      });
    }

    return [];
  }
}
