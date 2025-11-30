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

@Entity('fhir_medication_request')
@Index(['patient', 'authoredOn'])
@Index(['blockchainHash'])
export class MedicationRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Patient, (patient) => patient.medicationRequests, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @ManyToOne(
        () => Practitioner,
        (practitioner) => practitioner.medicationRequests,
        { nullable: true },
    )
    @JoinColumn({ name: 'practitioner_id' })
    practitioner: Practitioner;

    @Column({ length: 20, default: 'active' })
    status: string;

    @Column({ length: 20, default: 'order' })
    intent: string;

    @Column('jsonb')
    medicationCodeableConcept: any;

    @Column({ type: 'timestamp', nullable: true })
    authoredOn: Date;

    @Column('jsonb', { nullable: true })
    dosageInstruction: any;

    @Column('jsonb', { nullable: true })
    dispenseRequest: any;

    @Column('jsonb', { nullable: true })
    substitution: any;

    @Column({ type: 'text', nullable: true })
    note: string;

    @Column({ length: 20, nullable: true })
    priority: string;

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
        return `MedicationRequest ${this.id}`;
    }
}
