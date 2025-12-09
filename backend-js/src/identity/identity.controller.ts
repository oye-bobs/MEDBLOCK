import { Controller, Post, Body, Get, Param, UseGuards, Request, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DidService } from './did.service';
import { DidAuthGuard } from './guards/did-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreatePatientDto } from './dto/create-patient.dto';
import { CreatePractitionerDto } from './dto/create-practitioner.dto';
import { Patient } from '../database/entities/patient.entity';
import { Practitioner } from '../database/entities/practitioner.entity';

@ApiTags('identity')
@Controller('identity')
export class IdentityController {
    constructor(
        private didService: DidService,
        private jwtService: JwtService,
        @InjectRepository(Patient)
        private patientRepository: Repository<Patient>,
        @InjectRepository(Practitioner)
        private practitionerRepository: Repository<Practitioner>,
    ) { }

    @Get('patient/:did')
    @ApiOperation({ summary: 'Get patient details by DID' })
    @ApiResponse({ status: 200, description: 'Patient found' })
    async getPatient(@Param('did') did: string) {
        // We might need to handle the case where DID includes slashes or needs decoding, 
        // but typically standard DIDs are fine in URL params if simple. 
        // Best practice to encodeCOMPONENT in frontend.
        const patient = await this.patientRepository.findOne({ where: { did } });
        if (!patient) {
            throw new Error('Patient not found');
        }
        return patient;
    }

    @Post('practitioner/create')
    @ApiOperation({ summary: 'Create a new Practitioner identity' })
    @ApiResponse({ status: 201, description: 'Practitioner DID created successfully' })
    async createPractitioner(@Body() dto: CreatePractitionerDto) {
        // 1. Create DID
        const didResult = await this.didService.createDid('provider');

        // 2. Create Practitioner Record
        const practitioner = this.practitionerRepository.create({
            did: didResult.did,
            name: [{ text: dto.fullName }],
            telecom: [{ system: 'email', value: dto.email }],
            qualification: [{
                code: dto.licenseNumber,
                display: dto.specialty,
                issuer: dto.hospitalName
            }],
            active: true,
        });

        const savedPractitioner = await this.practitionerRepository.save(practitioner);

        // 3. Return combined result
        return {
            ...didResult,
            practitioner_id: savedPractitioner.id,
        };
    }

    @Post('patient/create')
    @ApiOperation({ summary: 'Create a new Patient identity' })
    @ApiResponse({ status: 201, description: 'Patient DID created successfully' })
    async createPatient(@Body() createPatientDto: CreatePatientDto) {
        // 1. Create DID
        const didResult = await this.didService.createDid('patient');

        // 2. Create Patient Record
        const patient = this.patientRepository.create({
            did: didResult.did,
            name: createPatientDto.name,
            gender: createPatientDto.gender,
            birthDate: createPatientDto.birth_date,
            telecom: createPatientDto.telecom,
            address: createPatientDto.address,
            walletAddress: createPatientDto.walletAddress,
            active: true,
        });

        const savedPatient = await this.patientRepository.save(patient);

        // 3. Return combined result
        return {
            ...didResult,
            patient_id: savedPatient.id,
        };
    }

    @Post('did/create')
    @ApiOperation({ summary: 'Create a new DID (Generic)' })
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

    @Post('login-wallet')
    @ApiOperation({ summary: 'Login with Wallet Address' })
    @ApiResponse({ status: 200, description: 'Wallet found, returns DID' })
    async loginWallet(@Body('walletAddress') walletAddress: string) {
        const patient = await this.patientRepository.findOne({ where: { walletAddress } });
        if (!patient) {
            // Return 404-like object or throw exception depending on frontend expectation
            // Throwing exception is cleaner for axios catch
            throw new Error('Wallet not found');
        }
        return {
            did: patient.did,
            patient_id: patient.id,
            // In a real implementation we would require signature verification here too
        };
    }

    @Post('practitioner/login')
    @ApiOperation({ summary: 'Login Practitioner with Email' })
    @ApiResponse({ status: 200, description: 'Practitioner found, returns DID' })
    async loginPractitioner(@Body('email') email: string) {
        // Find practitioner where telecom array contains an object with system='email' and value=email
        // Using raw query for JSONB array search
        const practitioner = await this.practitionerRepository
            .createQueryBuilder('practitioner')
            .where(`practitioner.telecom @> '[{"system": "email", "value": "${email}"}]'`)
            .getOne();

        if (!practitioner) {
            throw new Error('Practitioner not found');
        }

        return {
            did: practitioner.did,
            practitioner_id: practitioner.id,
            name: practitioner.name?.[0]?.text || email,
            // In a real implementation we would check password or require signature
        };
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
