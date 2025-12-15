import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Practitioner } from './practitioner.entity';

export enum ConsentStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  PENDING = 'pending',
}

@Entity('consent_record')
@Index(['patient', 'status'])
@Index(['practitioner', 'status'])
@Index(['expiresAt'])
export class ConsentRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, (patient) => patient.consents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(
    () => Practitioner,
    (practitioner) => practitioner.consentsReceived,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'practitioner_id' })
  practitioner: Practitioner;

  @Column({
    type: 'text',
    default: ConsentStatus.PENDING,
  })
  status: ConsentStatus;

  @Column({ type: 'text', nullable: true })
  initiatedBy: string;

  @Column('simple-json', { default: [] })
  scope: string[];

  @CreateDateColumn()
  grantedAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date;

  @Column({ length: 255 })
  smartContractAddress: string;

  @Column({ length: 255, unique: true })
  consentTxId: string;

  @Column({ length: 56, nullable: true })
  consentNftPolicyId: string;

  @Column({ length: 64, nullable: true })
  consentNftAssetName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  isActive(): boolean {
    const now = new Date();
    return (
      this.status === ConsentStatus.ACTIVE &&
      this.expiresAt > now &&
      !this.revokedAt
    );
  }

  toString(): string {
    return `Consent ${this.id} - Patient: ${this.patient?.did} -> Provider: ${this.practitioner?.did}`;
  }
}
