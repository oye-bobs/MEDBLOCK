import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Patient,
  Practitioner,
  ConsentRecord,
  ConsentStatus,
} from '../database/entities';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
    @InjectRepository(Practitioner)
    private practitionerRepo: Repository<Practitioner>,
    @InjectRepository(ConsentRecord)
    private consentRepo: Repository<ConsentRecord>,
  ) {}

  /**
   * Get all patients that a provider has active consent to access
   * This ensures strict data isolation - providers only see their own patients
   */
  async getProviderPatients(providerDid: string): Promise<Patient[]> {
    const provider = await this.practitionerRepo.findOne({
      where: { did: providerDid },
    });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // Get all active consents for this provider
    const activeConsents = await this.consentRepo.find({
      where: {
        practitioner: { id: provider.id },
        status: ConsentStatus.ACTIVE,
      },
      relations: ['patient'],
      order: { createdAt: 'DESC' },
    });

    // Extract unique patients
    const patients = activeConsents.map((consent) => consent.patient);

    return patients;
  }

  /**
   * Get a specific patient by DID, only if the provider has active consent
   * This allows DID-based access while maintaining security
   */
  async getPatientByDidForProvider(
    patientDid: string,
    providerDid: string,
  ): Promise<Patient> {
    const provider = await this.practitionerRepo.findOne({
      where: { did: providerDid },
    });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const patient = await this.patientRepo.findOne({
      where: { did: patientDid },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Check if provider has active consent for this patient
    const consent = await this.consentRepo.findOne({
      where: {
        patient: { id: patient.id },
        practitioner: { id: provider.id },
        status: ConsentStatus.ACTIVE,
      },
    });

    if (!consent || !consent.isActive()) {
      throw new NotFoundException('No active consent found for this patient');
    }

    return patient;
  }

  /**
   * Check if a provider has access to a specific patient
   */
  async hasProviderAccess(
    patientDid: string,
    providerDid: string,
  ): Promise<boolean> {
    const provider = await this.practitionerRepo.findOne({
      where: { did: providerDid },
    });
    if (!provider) return false;

    const patient = await this.patientRepo.findOne({
      where: { did: patientDid },
    });
    if (!patient) return false;

    const consent = await this.consentRepo.findOne({
      where: {
        patient: { id: patient.id },
        practitioner: { id: provider.id },
        status: ConsentStatus.ACTIVE,
      },
    });

    return consent ? consent.isActive() : false;
  }

  /**
   * Get patient's own data (for patient portal)
   */
  async getPatientOwnData(patientDid: string): Promise<Patient> {
    const patient = await this.patientRepo.findOne({
      where: { did: patientDid },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return patient;
  }
}
