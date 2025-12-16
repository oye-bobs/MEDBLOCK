import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ConsentService } from './consent.service';
import { DidAuthGuard } from '../identity/guards/did-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('consent')
@Controller('consent')
@UseGuards(DidAuthGuard)
@ApiBearerAuth()
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Post('grant')
  @ApiOperation({ summary: 'Grant consent to a provider' })
  async grantConsent(
    @Body()
    body: { providerDid: string; scope?: string[]; durationHours?: number },
    @Request() req,
  ) {
    return this.consentService.grantConsent(
      req.user.did,
      body.providerDid,
      body.scope,
      body.durationHours,
    );
  }

  @Post(':id/revoke')
  @ApiOperation({ summary: 'Revoke consent' })
  async revokeConsent(@Param('id') id: string, @Request() req) {
    return this.consentService.revokeConsent(id, req.user.did);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active consents' })
  async getActiveConsents(@Request() req) {
    return this.consentService.getActiveConsents(req.user.did);
  }
  @Post('request')
  @ApiOperation({ summary: 'Request consent from a patient' })
  async requestConsent(
    @Body() body: { patientDid: string; purpose: string; scope: string[] },
    @Request() req,
  ) {
    return this.consentService.requestConsent(
      req.user.did,
      body.patientDid,
      body.purpose,
      body.scope,
    );
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending consent requests' })
  async getPendingConsents(@Request() req) {
    return this.consentService.getPendingConsents(req.user.did);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a consent request' })
  async approveConsent(@Param('id') id: string, @Request() req) {
    return this.consentService.approveConsent(id, req.user.did);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a consent request' })
  async rejectConsent(@Param('id') id: string, @Request() req) {
    return this.consentService.rejectConsent(id, req.user.did);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all consents (active, pending, revoked) for audit purposes',
  })
  async getAllConsents(@Request() req) {
    return this.consentService.getAllConsents(req.user.did);
  }
}
