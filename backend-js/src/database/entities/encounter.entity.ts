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

@Entity('fhir_encounter')
@Index(['patient', 'periodStart'])
export class Encounter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, (patient) => patient.encounters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Practitioner, (practitioner) => practitioner.encounters, {
    nullable: true,
  })
  @JoinColumn({ name: 'practitioner_id' })
  practitioner: Practitioner;

  @Column({ length: 20, default: 'finished' })
  status: string;

  @Column('simple-json', { nullable: true })
  class: any;

  @Column('simple-json', { nullable: true })
  type: any;

  @Column({ type: 'timestamp', nullable: true })
  periodStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  periodEnd: Date;

  @Column('simple-json', { nullable: true })
  reasonCode: any;

  @Column('simple-json', { nullable: true })
  diagnosis: any;

  @Column('simple-json', { nullable: true })
  hospitalization: any;

  @Column('simple-json', { nullable: true })
  location: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 64, unique: true })
  blockchainHash: string;

  @Column({ length: 255, nullable: true })
  blockchainTxId: string;

  toString(): string {
    return `Encounter ${this.id}`;
  }
}
