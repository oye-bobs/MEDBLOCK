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
@Index(['blockchainHash'])
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

    @Column('jsonb', { nullable: true })
    class: any;

    @Column('jsonb', { nullable: true })
    type: any;

    @Column({ type: 'timestamp', nullable: true })
    periodStart: Date;

    @Column({ type: 'timestamp', nullable: true })
    periodEnd: Date;

    @Column('jsonb', { nullable: true })
    reasonCode: any;

    @Column('jsonb', { nullable: true })
    diagnosis: any;

    @Column('jsonb', { nullable: true })
    hospitalization: any;

    @Column('jsonb', { nullable: true })
    location: any;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ length: 64, unique: true })
    @Index()
    blockchainHash: string;

    @Column({ length: 255, nullable: true })
    blockchainTxId: string;

    toString(): string {
        return `Encounter ${this.id}`;
    }
}
