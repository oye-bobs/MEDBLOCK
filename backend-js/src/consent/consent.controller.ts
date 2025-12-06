import { Controller, Post, Body, Param, Get, UseGuards, Request } from '@nestjs/common';
import { ConsentService } from './consent.service';
import { DidAuthGuard } from '../identity/guards/did-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('consent')
@Controller('consent')
@UseGuards(DidAuthGuard)
@ApiBearerAuth()
export class ConsentController {
    constructor(private readonly consentService: ConsentService) { }

    @Post('grant')
    @ApiOperation({ summary: 'Grant consent to a provider' })
    async grantConsent(@Body() body: { providerDid: string; scope?: string[]; durationHours?: number }, @Request() req) {
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
}
