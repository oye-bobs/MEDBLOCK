import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Practitioner } from './practitioner.entity';

export enum NotificationType {
  CONSENT_REQUEST = 'consent_request',
  CONSENT_APPROVED = 'consent_approved',
  CONSENT_REJECTED = 'consent_rejected',
  CONSENT_REVOKED = 'consent_revoked',
  RECORD_SHARED = 'record_shared',
  ACCESS_GRANTED = 'access_granted',
  SYSTEM_ALERT = 'system_alert',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD,
  })
  status: NotificationStatus;

  // Recipient DID (can be patient or practitioner)
  @Column({ type: 'text' })
  recipientDid: string;

  // Optional: Link to patient if notification is for a patient
  @ManyToOne(() => Patient, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient?: Patient;

  // Optional: Link to practitioner if notification is for a practitioner
  @ManyToOne(() => Practitioner, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'practitionerId' })
  practitioner?: Practitioner;

  // Optional metadata (JSON field for additional data)
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Optional: Related entity ID (e.g., consent ID, record ID)
  @Column({ type: 'text', nullable: true })
  relatedEntityId?: string;

  // Optional: Related entity type
  @Column({ type: 'text', nullable: true })
  relatedEntityType?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;
}
