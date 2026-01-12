import { Injectable, UnauthorizedException, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  AdminUser,
  AdminLog,
  AdminRole,
  Patient,
  Practitioner,
  ConsentRecord,
  Observation,
  DiagnosticReport,
  MedicationRequest,
  AccessLog,
  Encounter,
  Notification
} from '../database/entities';

@Injectable()
export class AdminService implements OnModuleInit {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(AdminUser)
    private adminRepository: Repository<AdminUser>,
    @InjectRepository(AdminLog)
    private logRepository: Repository<AdminLog>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Practitioner)
    private practitionerRepository: Repository<Practitioner>,
    @InjectRepository(ConsentRecord)
    private consentRepository: Repository<ConsentRecord>,
    @InjectRepository(Observation)
    private observationRepository: Repository<Observation>,
    @InjectRepository(DiagnosticReport)
    private diagnosticReportRepository: Repository<DiagnosticReport>,
    @InjectRepository(MedicationRequest)
    private medicationRepository: Repository<MedicationRequest>,
    @InjectRepository(AccessLog)
    private accessLogRepository: Repository<AccessLog>,
    @InjectRepository(Encounter)
    private encounterRepository: Repository<Encounter>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    await this.seedDefaultAdmin();
  }

  private async seedDefaultAdmin() {
    const adminCount = await this.adminRepository.count();
    if (adminCount === 0) {
      this.logger.log('No admin users found. Creating default super-admin...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const defaultAdmin = this.adminRepository.create({
        email: 'admin@medblock.com',
        passwordHash: hashedPassword,
        role: AdminRole.SUPER_ADMIN,
        isActive: true,
      });
      await this.adminRepository.save(defaultAdmin);
      this.logger.log('Default super-admin created: admin@medblock.com / admin123');
    }
  }

  async login(email: string, password: string): Promise<any> {
    const admin = await this.adminRepository.findOne({ where: { email, isActive: true } });
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: admin.id, email: admin.email, role: admin.role, type: 'admin' };
    
    admin.lastLogin = new Date();
    await this.adminRepository.save(admin);

    await this.logAction(admin.id, 'LOGIN', 'AdminUser', admin.id, { email: admin.email });

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        twoFactorEnabled: admin.twoFactorEnabled,
      },
    };
  }

  async logAction(adminId: string, action: string, targetType: string, targetId: string, details: any = null) {
    const log = this.logRepository.create({
      adminId,
      action,
      targetType,
      targetId,
      details,
    });
    return this.logRepository.save(log);
  }

  async getDashboardStats() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalPatients, totalPractitioners, totalConsents, totalRecords, totalEncounters] = await Promise.all([
      this.patientRepository.count(),
      this.practitionerRepository.count(),
      this.consentRepository.count(),
      this.getTotalRecordsCount(),
      this.encounterRepository.count(),
    ]);

    const activeUsers24h = await this.getActiveUsersCount(last24h);
    const newRegistrations24h = await this.getNewRegistrationsCount(last24h);
    const recordsUploaded24h = await this.getRecordsUploadedCount(last24h);
    const trends = await this.getTrendData();
    const recentLogs = await this.logRepository.find({
        order: { createdAt: 'DESC' },
        take: 5,
        relations: ['admin']
    });

    return {
      totalUsers: totalPatients + totalPractitioners,
      patientCount: totalPatients,
      providerCount: totalPractitioners,
      totalRecords,
      totalConsents,
      totalEncounters,
      activeUsers24h,
      newRegistrations24h,
      recordsUploaded24h,
      trends,
      recentEvents: recentLogs.map(l => ({
        title: l.action.replace(/_/g, ' '),
        user: l.admin?.email || 'System',
        createdAt: l.createdAt,
        type: l.action.includes('LOGIN') ? 'system' : 
              l.action.includes('USER') ? 'registration' : 'access'
      })),
      systemHealth: {
        api: 'Operational',
        blockchain: 'Connected',
        storage: 'Healthy',
      }
    };
  }

  private async getTrendData() {
    const days = 7;
    const trends: any[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
        
        const [counts, consents] = await Promise.all([
            this.getRecordsUploadedBetween(dayStart, dayEnd),
            this.consentRepository.count({ where: { createdAt: Between(dayStart, dayEnd) } })
        ]);
        
        trends.push({
            label: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
            uploads: counts,
            consents: consents
        });
    }
    return trends;
  }

  private async getRecordsUploadedBetween(start: Date, end: Date) {
    const [obs, diag, med] = await Promise.all([
      this.observationRepository.count({ where: { createdAt: Between(start, end) } }),
      this.diagnosticReportRepository.count({ where: { createdAt: Between(start, end) } }),
      this.medicationRepository.count({ where: { createdAt: Between(start, end) } }),
    ]);
    return obs + diag + med;
  }

  async getSystemHealth() {
    let dbStatus = 'Operational';
    try {
      await this.adminRepository.query('SELECT 1');
    } catch (e) {
      dbStatus = 'Degraded';
    }

    return {
      api: 'Operational',
      database: dbStatus,
      blockchain: 'Connected',
      storage: 'Healthy',
      uptime: Math.floor(process.uptime()),
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      timestamp: new Date()
    };
  }

  private async getTotalRecordsCount() {
    const [obs, diag, med] = await Promise.all([
      this.observationRepository.count(),
      this.diagnosticReportRepository.count(),
      this.medicationRepository.count(),
    ]);
    return obs + diag + med;
  }

  private async getActiveUsersCount(since: Date) {
    // Count unique accessors in AccessLog and active practitioners/patients recently updated
    const results = await this.accessLogRepository
        .createQueryBuilder('log')
        .select('COUNT(DISTINCT log.accessorDid)', 'count')
        .where('log.accessedAt > :since', { since })
        .getRawOne();
    
    // Also consider practitioners who were updated recently (as a proxy for activity)
    const activePractitioners = await this.practitionerRepository.count({
        where: { updatedAt: MoreThan(since) }
    });

    return parseInt(results?.count || 0) + activePractitioners;
  }

  private async getNewRegistrationsCount(since: Date) {
    const patients = await this.patientRepository.count({
      where: { createdAt: MoreThan(since) }
    });
    const practitioners = await this.practitionerRepository.count({
      where: { createdAt: MoreThan(since) }
    });
    return patients + practitioners;
  }

  private async getRecordsUploadedCount(since: Date) {
    const [obs, diag, med] = await Promise.all([
      this.observationRepository.count({ where: { createdAt: MoreThan(since) } }),
      this.diagnosticReportRepository.count({ where: { createdAt: MoreThan(since) } }),
      this.medicationRepository.count({ where: { createdAt: MoreThan(since) } }),
    ]);
    return obs + diag + med;
  }

  async getUsers(role?: string, query?: string) {
    if (role === 'patient') {
        let qb = this.patientRepository.createQueryBuilder('patient');
        if (query) {
            qb = qb.where('LOWER(CAST(patient.name AS TEXT)) LIKE :query OR patient.did LIKE :query', { query: `%${query.toLowerCase()}%` });
        }
        return qb.getMany();
    } else if (role === 'provider') {
        let qb = this.practitionerRepository.createQueryBuilder('provider');
        if (query) {
            qb = qb.where('LOWER(CAST(provider.name AS TEXT)) LIKE :query OR provider.did LIKE :query', { query: `%${query.toLowerCase()}%` });
        }
        return qb.getMany();
    }
    return [];
  }

  async toggleUserStatus(type: 'patient' | 'provider', id: string, active: boolean, adminId: string) {
    const repo = type === 'patient' ? this.patientRepository : this.practitionerRepository;
    const user = await repo.findOne({ where: { id } } as any);
    if (user) {
        (user as any).active = active;
        await (repo as any).save(user);

        this.eventEmitter.emit('user.status.changed', { 
            type, 
            id, 
            did: (user as any).did,
            active,
            timestamp: new Date()
        });

        // Also emit a general notification event for the "push" popup
        this.eventEmitter.emit('notification.created', {
            recipientDid: (user as any).did,
            notification: {
                title: active ? 'Account Activated' : 'Account Suspended',
                message: active 
                    ? 'Your account has been activated/verified by the administrator.' 
                    : 'Your account has been suspended by the administrator.',
                type: 'SYSTEM',
                createdAt: new Date()
            }
        });

        await this.logAction(adminId, active ? 'ACTIVATE_USER' : 'DEACTIVATE_USER', type === 'patient' ? 'Patient' : 'Practitioner', id);
    }
    return user;
  }

  async getAdminLogs() {
    return this.logRepository.find({
        order: { createdAt: 'DESC' },
        take: 100,
        relations: ['admin']
    });
  }

  async getProviderStats() {
    const verifiedCount = await this.practitionerRepository.count({ where: { active: true } });
    const pendingCount = await this.practitionerRepository.count({ where: { active: false } });
    
    // Calculate avg uploads / day based on last 24h activity
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recordsUploaded24h = await this.getRecordsUploadedCount(last24h);
    
    const avgUploads = verifiedCount > 0 ? Math.round(recordsUploaded24h / verifiedCount) : 0; 

    // Mock fraud flags for now as there isn't a dedicated table or it's not set up
    const fraudFlags = 0; 

    return {
        verifiedCount,
        pendingCount,
        avgUploads,
        fraudFlags
    };
  }
}
