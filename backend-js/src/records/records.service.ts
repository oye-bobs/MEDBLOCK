import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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
  ) {}

  async createObservation(data: any, userDid: string): Promise<Observation> {
    // 1. Validate Patient
    const patient = await this.patientRepo.findOne({
      where: { did: data.patientDid },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    // 2. Validate Practitioner (Identify the provider creating the record)
    let practitioner: Practitioner | null = null;

    // First check if the authenticated user is a practitioner
    practitioner = await this.practitionerRepo.findOne({
      where: { did: userDid },
    });

    // Fallback: Check body (only if user lookup failed, though typically user should be the practitioner)
    if (!practitioner && data.practitionerDid) {
      practitioner = await this.practitionerRepo.findOne({
        where: { did: data.practitionerDid },
      });
    }

    // Check Access (Consent)
    await this.checkAccess(userDid, patient);

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
        { code: data.code.coding?.[0]?.code },
      );
    } catch (e) {
      this.logger.warn(
        `Blockchain submission failed: ${e.message}. Proceeding with DB save.`,
      );
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
      attachment: data.attachment,
      blockchainHash: recordHash,
      blockchainTxId: txHash,
    });

    const saved = await this.observationRepo.save(observation);

    // 7. Log Access
    await this.logAccess(
      userDid,
      patient,
      'Observation',
      saved.id,
      AccessAction.CREATE,
    );

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
    await this.logAccess(
      userDid,
      observation.patient,
      'Observation',
      id,
      AccessAction.READ,
    );

    return observation;
  }

  async getPatientObservations(
    patientDid: string,
    userDid: string,
  ): Promise<Observation[]> {
    const patient = await this.patientRepo.findOne({
      where: { did: patientDid },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    // Check Access
    await this.checkAccess(userDid, patient);

    const observations = await this.observationRepo.find({
      where: { patient: { id: patient.id } },
      relations: ['practitioner'],
      order: { effectiveDatetime: 'DESC' },
    });

    // Decrypt all
    return observations.map((obs) => {
      obs.value = this.encryptionService.decryptObject(obs.value);
      obs.note = this.encryptionService.decrypt(obs.note);
      return obs;
    });
  }

  async getAccessLogs(
    patientDid: string,
    userDid: string,
  ): Promise<AccessLog[]> {
    const patient = await this.patientRepo.findOne({
      where: { did: patientDid },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    // Security check - Re-use standard access check (Patient Match OR Consent)
    await this.checkAccess(userDid, patient);

    return this.accessLogRepo.find({
      where: { patient: { id: patient.id } },
      order: { accessedAt: 'DESC' },
      relations: ['patient'],
    });
  }

  async getProviderAccessLogs(providerDid: string): Promise<AccessLog[]> {
    const logs = await this.accessLogRepo.find({
      where: { accessorDid: providerDid },
      order: { accessedAt: 'DESC' },
      relations: ['patient'],
    });

    // Ensure patient data is properly formatted
    return logs.map((log) => ({
      ...log,
      patient: log.patient
        ? {
            id: log.patient.id,
            did: log.patient.did,
            name: log.patient.name || [{ text: 'Unknown Patient' }],
            birthDate: log.patient.birthDate,
            gender: log.patient.gender,
          }
        : null,
    })) as AccessLog[];
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
