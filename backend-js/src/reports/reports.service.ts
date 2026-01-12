import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus, Practitioner } from '../database/entities';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
    @InjectRepository(Practitioner)
    private readonly practitionerRepo: Repository<Practitioner>,
  ) {}

  async createReport(data: {
    reporterDid: string;
    reportedDid: string;
    reason: string;
    description?: string;
  }) {
    const report = this.reportRepo.create({
      ...data,
      status: ReportStatus.PENDING,
    });
    return this.reportRepo.save(report);
  }

  async getAllReports() {
    return this.reportRepo.find({
      relations: ['reporter', 'reportedPractitioner'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateReportStatus(id: string, status: ReportStatus, adminNotes?: string) {
    const report = await this.reportRepo.findOne({ where: { id } });
    if (!report) throw new Error('Report not found');
    
    report.status = status;
    if (adminNotes) {
      report.adminNotes = adminNotes;
    }
    
    return this.reportRepo.save(report);
  }
}
