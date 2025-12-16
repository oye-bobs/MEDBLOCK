import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Patient } from './patient.entity';
import { ConsentRecord } from './consent-record.entity';

export enum AccessAction {
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

@Entity('access_log')
@Index(['patient', 'accessedAt'])
@Index(['accessorDid', 'accessedAt'])
@Index(['resourceType', 'resourceId'])
export class AccessLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  @Index()
  accessorDid: string;

  @ManyToOne(() => Patient, (patient) => patient.accessLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ length: 50 })
  resourceType: string;

  @Column('uuid')
  resourceId: string;

  @Column({
    type: 'text',
  })
  action: AccessAction;

  @ManyToOne(() => ConsentRecord, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'consent_id' })
  consent: ConsentRecord;

  @CreateDateColumn()
  accessedAt: Date;

  @Column({ length: 255, nullable: true })
  blockchainTxId: string;

  @Column({ type: 'text', nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  toString(): string {
    return `Access ${this.id} - ${this.accessorDid} accessed ${this.resourceType} at ${this.accessedAt}`;
  }
}
