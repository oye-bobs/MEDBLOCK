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
import { AccessLog } from './access-log.entity';

@Entity('fhir_patient')
@Index(['birthDate'])
export class Patient {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, length: 255 })
    did: string;

    @Column('simple-json', { default: [] })
    identifier: any[];

    @Column('simple-json')
    name: any;

    @Column({ length: 20, nullable: true })
    gender: string;

    @Column({ type: 'date', nullable: true })
    birthDate: Date;

    @Column('simple-json', { nullable: true })
    address: any;

    @Column('simple-json', { nullable: true })
    telecom: any;

    @Column({ type: 'boolean', default: true })
    active: boolean;

    @Column({ type: 'text', nullable: true })
    photo: string;

    @Column('simple-json', { nullable: true })
    communication: any;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ length: 64, nullable: true })
    blockchainHash: string;

    @Column({ length: 255, nullable: true })
    blockchainTxId: string;

    @Column({ length: 255, nullable: true, unique: true })
    walletAddress: string;

    // Relations
    @OneToMany(() => Observation, (observation) => observation.patient)
    observations: Observation[];

    @OneToMany(() => DiagnosticReport, (report) => report.patient)
    diagnosticReports: DiagnosticReport[];

    @OneToMany(() => MedicationRequest, (medication) => medication.patient)
    medicationRequests: MedicationRequest[];

    @OneToMany(() => Encounter, (encounter) => encounter.patient)
    encounters: Encounter[];

    @OneToMany(() => ConsentRecord, (consent) => consent.patient)
    consents: ConsentRecord[];

    @OneToMany(() => AccessLog, (log) => log.patient)
    accessLogs: AccessLog[];

    toString(): string {
        return `Patient ${this.id} - DID: ${this.did}`;
    }
}
