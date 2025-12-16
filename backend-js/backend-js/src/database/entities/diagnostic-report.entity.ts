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

@Entity('fhir_diagnostic_report')
@Index(['patient', 'effectiveDatetime'])
export class DiagnosticReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, (patient) => patient.diagnosticReports, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(
    () => Practitioner,
    (practitioner) => practitioner.diagnosticReports,
    { nullable: true },
  )
  @JoinColumn({ name: 'practitioner_id' })
  practitioner: Practitioner;

  @Column({ length: 20, default: 'final' })
  status: string;

  @Column('simple-json', { nullable: true })
  category: any;

  @Column('simple-json')
  code: any;

  @Column({ type: 'text', nullable: true })
  conclusion: string;

  @Column('simple-json', { nullable: true })
  conclusionCode: any;

  @Column({ type: 'timestamp', nullable: true })
  effectiveDatetime: Date;

  @Column({ type: 'timestamp', nullable: true })
  issued: Date;

  @Column('simple-json', { nullable: true })
  result: any;

  @Column('simple-json', { nullable: true })
  imagingStudy: any;

  @Column('simple-json', { nullable: true })
  media: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 64, unique: true })
  blockchainHash: string;

  @Column({ length: 255, nullable: true })
  blockchainTxId: string;

  toString(): string {
    return `DiagnosticReport ${this.id}`;
  }
}
