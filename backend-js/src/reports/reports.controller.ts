import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Param,
  Patch,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { DidAuthGuard } from '../identity/guards/did-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportStatus } from '../database/entities';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(DidAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a report against a doctor' })
  async createReport(@Request() req, @Body() body: { reportedDid: string; reason: string; description?: string }) {
    return this.reportsService.createReport({
      reporterDid: req.user.did,
      ...body,
    });
  }

  @Get('admin/all')
  @ApiOperation({ summary: 'Get all reports (Admin)' })
  async getAllReports() {
    // Ideally this should be protected by an AdminGuard
    return this.reportsService.getAllReports();
  }

  @Patch('admin/:id/status')
  @ApiOperation({ summary: 'Update report status (Admin)' })
  async updateReportStatus(
    @Param('id') id: string,
    @Body() body: { status: ReportStatus; adminNotes?: string },
  ) {
    return this.reportsService.updateReportStatus(id, body.status, body.adminNotes);
  }
}
