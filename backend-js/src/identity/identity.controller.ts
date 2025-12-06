import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { DidService } from './did.service';
import { DidAuthGuard } from './guards/did-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('identity')
@Controller('identity')
export class IdentityController {
    constructor(
        private didService: DidService,
        private jwtService: JwtService,
    ) { }

    @Post('did/create')
    @ApiOperation({ summary: 'Create a new DID' })
    @ApiResponse({ status: 201, description: 'DID created successfully' })
    async createDid(@Body('type') type: 'patient' | 'provider') {
        return this.didService.createDid(type);
    }

    @Get('did/:did')
    @ApiOperation({ summary: 'Resolve a DID' })
    @ApiResponse({ status: 200, description: 'DID document found' })
    async resolveDid(@Param('did') did: string) {
        return this.didService.resolveDid(did);
    }

    @Post('authenticate')
    @ApiOperation({ summary: 'Authenticate with DID signature' })
    @ApiResponse({ status: 200, description: 'Authentication successful, returns JWT' })
    async authenticate(@Body() body: { did: string; message: string; signature: string; role: string }) {
        const isValid = await this.didService.verifySignature(body.did, body.message, body.signature);

        if (!isValid) {
            return { error: 'Invalid signature' };
        }

        const payload = { did: body.did, role: body.role };
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }

    @Get('profile')
    @UseGuards(DidAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get authenticated user profile' })
    getProfile(@Request() req) {
        return req.user;
    }
}
