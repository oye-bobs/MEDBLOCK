import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { DidAuthGuard } from '../identity/guards/did-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('records')
@Controller('records')
@UseGuards(DidAuthGuard)
@ApiBearerAuth()
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post('observations')
  @ApiOperation({ summary: 'Create a new observation' })
  async createObservation(@Body() body: any, @Request() req) {
    return this.recordsService.createObservation(body, req.user.did);
  }

  @Get('observations/:id')
  @ApiOperation({ summary: 'Get observation by ID' })
  async getObservation(@Param('id') id: string, @Request() req) {
    return this.recordsService.getObservation(id, req.user.did);
  }

  @Get('observations/patient/:did')
  @ApiOperation({ summary: 'Get all observations for a patient' })
  async getPatientObservations(@Param('did') did: string, @Request() req) {
    return this.recordsService.getPatientObservations(did, req.user.did);
  }

  @Get('access-logs/provider/me')
  @ApiOperation({ summary: 'Get access logs for the authenticated provider' })
  async getProviderAuditLogs(@Request() req) {
    return this.recordsService.getProviderAccessLogs(req.user.did);
  }

  @Get('access-logs/:did')
  @ApiOperation({ summary: 'Get access logs for a patient' })
  async getAccessLogs(@Param('did') did: string, @Request() req) {
    return this.recordsService.getAccessLogs(did, req.user.did);
  }
}
