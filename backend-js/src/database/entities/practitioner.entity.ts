import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Observation } from './observation.entity';
import { DiagnosticReport } from './diagnostic-report.entity';
import { MedicationRequest } from './medication-request.entity';
import { Encounter } from './encounter.entity';
import { ConsentRecord } from './consent-record.entity';

@Entity('fhir_practitioner')
export class Practitioner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  did: string;

  @Column('simple-json')
  name: any;

  @Column({ length: 20, nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column('simple-json', { default: [] })
  qualification: any[];

  @Column('simple-json', { nullable: true })
  telecom: any;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column('simple-json', { nullable: true })
  meta: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Observation, (observation) => observation.practitioner)
  observations: Observation[];

  @OneToMany(() => DiagnosticReport, (report) => report.practitioner)
  diagnosticReports: DiagnosticReport[];

  @OneToMany(() => MedicationRequest, (medication) => medication.practitioner)
  medicationRequests: MedicationRequest[];

  @OneToMany(() => Encounter, (encounter) => encounter.practitioner)
  encounters: Encounter[];

  @OneToMany(() => ConsentRecord, (consent) => consent.practitioner)
  consentsReceived: ConsentRecord[];

  toString(): string {
    return `Practitioner ${this.id} - DID: ${this.did}`;
  }
}
