import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AdminUser } from './admin-user.entity';

@Entity('admin_logs')
export class AdminLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  adminId: string;

  @ManyToOne(() => AdminUser)
  @JoinColumn({ name: 'adminId' })
  admin: AdminUser;

  @Column()
  action: string; // e.g., 'UPDATE_USER', 'DEACTIVATE_PROVIDER', 'LOGIN'

  @Column()
  targetType: string; // e.g., 'Practitioner', 'Patient', 'AdminUser'

  @Column({ nullable: true })
  targetId: string;

  @Column('simple-json', { nullable: true })
  details: any;

  @Column({ nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}
