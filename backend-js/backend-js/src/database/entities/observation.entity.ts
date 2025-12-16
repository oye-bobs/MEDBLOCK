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

@Entity('fhir_observation')
@Index(['patient', 'effectiveDatetime'])
export class Observation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, (patient) => patient.observations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Practitioner, (practitioner) => practitioner.observations, {
    nullable: true,
  })
  @JoinColumn({ name: 'practitioner_id' })
  practitioner: Practitioner;

  @Column({ length: 20, default: 'final' })
  status: string;

  @Column('simple-json', { nullable: true })
  category: any;

  @Column('simple-json')
  code: any;

  @Column('simple-json', { nullable: true })
  value: any;

  @Column('simple-json', { nullable: true })
  attachment: {
    url: string;
    type: string;
    title?: string;
    size?: number;
  };

  @Column({ type: 'timestamp', nullable: true })
  effectiveDatetime: Date;

  @Column({ type: 'timestamp', nullable: true })
  issued: Date;

  @Column('simple-json', { nullable: true })
  interpretation: any;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'text', nullable: true })
  bodySite: string;

  @Column({ type: 'text', nullable: true })
  method: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 64, unique: true })
  blockchainHash: string;

  @Column({ length: 255, nullable: true })
  blockchainTxId: string;

  toString(): string {
    return `Observation ${this.id}`;
  }
}
