import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Practitioner } from './practitioner.entity';

export enum ReportStatus {
  PENDING = 'pending',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reporter_did' })
  reporterDid: string;

  @Column({ name: 'reported_did' })
  reportedDid: string;

  @Column()
  reason: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @Column({ type: 'text', nullable: true })
  adminNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'reporter_did', referencedColumnName: 'did' })
  reporter: Patient;

  @ManyToOne(() => Practitioner)
  @JoinColumn({ name: 'reported_did', referencedColumnName: 'did' })
  reportedPractitioner: Practitioner;
}
