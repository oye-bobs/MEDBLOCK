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
import { Observation } from '../database/entities/observation.entity';
import { DiagnosticReport } from '../database/entities/diagnostic-report.entity';
import { MedicationRequest } from '../database/entities/medication-request.entity';
import { ConsentRecord, ConsentStatus } from '../database/entities/consent-record.entity';

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
        @InjectRepository(Observation)
        private observationRepository: Repository<Observation>,
        @InjectRepository(DiagnosticReport)
        private diagnosticReportRepository: Repository<DiagnosticReport>,
        @InjectRepository(MedicationRequest)
        private medicationRequestRepository: Repository<MedicationRequest>,
        @InjectRepository(ConsentRecord)
        private consentRecordRepository: Repository<ConsentRecord>,
    ) { }

    @Get('patient/search')
    @ApiOperation({ summary: 'Search patients by name, DID, or other attributes' })
    @ApiResponse({ status: 200, description: 'Returns matching patients' })
    async searchPatients(@Query('query') query: string) {
        if (!query) {
            return [];
        }

        const normalizedQuery = query.toLowerCase().trim();

        const patients = await this.patientRepository
            .createQueryBuilder('patient')
            // Match DID
            .where('LOWER(patient.did) LIKE :query', { query: `%${normalizedQuery}%` })
            // Match Name (searching inside the JSON string)
            .orWhere('LOWER(CAST(patient.name AS TEXT)) LIKE :query', { query: `%${normalizedQuery}%` })
            // Match Telecom (email, phone)
            .orWhere('LOWER(CAST(patient.telecom AS TEXT)) LIKE :query', { query: `%${normalizedQuery}%` })
            // Match Wallet Address
            .orWhere('LOWER(patient.walletAddress) LIKE :query', { query: `%${normalizedQuery}%` })
            .getMany();

        return patients;
    }

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
        // 1. Hash password
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // 2. Create DID
        const didResult = await this.didService.createDid('provider');

        // 3. Create Practitioner Record
        const practitioner = this.practitionerRepository.create({
            did: didResult.did,
            name: [{ text: dto.fullName }],
            telecom: [{ system: 'email', value: dto.email }],
            qualification: [{
                code: dto.licenseNumber || 'N/A',
                display: dto.specialty,
                issuer: `${dto.hospitalName} (${dto.hospitalType})`
            }],
            active: true,
            // Store password hash and hospital type in meta field
            meta: {
                password: hashedPassword,
                hospitalType: dto.hospitalType,
                hospitalName: dto.hospitalName
            }
        });

        const savedPractitioner = await this.practitionerRepository.save(practitioner);

        // 4. Return combined result
        return {
            ...didResult,
            practitioner_id: savedPractitioner.id,
            name: dto.fullName,
            email: dto.email
        };
    }

    @Post('patient/create')
    @ApiOperation({ summary: 'Create a new Patient identity' })
    @ApiResponse({ status: 201, description: 'Patient DID created successfully' })
    async createPatient(@Body() createPatientDto: CreatePatientDto) {
        try {
            console.log('Creating patient with data:', JSON.stringify(createPatientDto, null, 2));

            // 1. Create DID
            const didResult = await this.didService.createDid('patient');
            console.log('DID created:', didResult.did);

            // 2. Create Patient Record
            const patient = this.patientRepository.create({
                did: didResult.did,
                name: createPatientDto.name,
                gender: createPatientDto.gender,
                birthDate: createPatientDto.birth_date ? new Date(createPatientDto.birth_date) : undefined,
                telecom: createPatientDto.telecom || [],
                address: createPatientDto.address || [],
                walletAddress: createPatientDto.walletAddress,
                active: true,
            });

            console.log('Patient entity created, attempting to save...');
            const savedPatient = await this.patientRepository.save(patient);
            console.log('Patient saved successfully:', savedPatient.id);

            // 3. Return combined result
            return {
                ...didResult,
                patient_id: savedPatient.id,
            };
        } catch (error) {
            console.error('Error creating patient:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }
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
    @ApiOperation({ summary: 'Login Practitioner with Email and Password' })
    @ApiResponse({ status: 200, description: 'Practitioner authenticated successfully' })
    async loginPractitioner(@Body() body: { email: string; password: string }) {
        const bcrypt = require('bcrypt');

        // Find practitioner by email - cast telecom to jsonb for the @> operator
        const practitioner = await this.practitionerRepository
            .createQueryBuilder('practitioner')
            .where(`practitioner.telecom::jsonb @> :telecom::jsonb`, {
                telecom: JSON.stringify([{ system: 'email', value: body.email }])
            })
            .getOne();

        if (!practitioner) {
            throw new Error('Invalid email or password');
        }

        // Verify password
        const storedPassword = practitioner.meta?.password;
        if (!storedPassword) {
            throw new Error('Password not set for this account');
        }

        const isPasswordValid = await bcrypt.compare(body.password, storedPassword);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        return {
            did: practitioner.did,
            practitioner_id: practitioner.id,
            name: practitioner.name?.[0]?.text || body.email,
            email: body.email,
            accessToken: this.jwtService.sign({ did: practitioner.did, role: 'provider' })
        };
    }

    @Get('practitioner/recent')
    @ApiOperation({ summary: 'Get recent practitioner signups' })
    @ApiResponse({ status: 200, description: 'Returns recent practitioners' })
    async getRecentPractitioners() {
        const practitioners = await this.practitionerRepository
            .createQueryBuilder('practitioner')
            .orderBy('practitioner.createdAt', 'DESC')
            .take(10)
            .getMany();

        return practitioners.map(p => ({
            id: p.id,
            name: p.name?.[0]?.text || 'Unknown',
            email: p.telecom?.find((t: any) => t.system === 'email')?.value || 'N/A',
            hospitalName: p.meta?.hospitalName || p.qualification?.[0]?.issuer || 'N/A',
            specialty: p.qualification?.[0]?.display || 'General Practice',
            hospitalType: p.meta?.hospitalType || 'N/A'
        }));
    }

    @Get('practitioner/stats/dashboard')
    @ApiOperation({ summary: 'Get provider dashboard stats' })
    @ApiResponse({ status: 200, description: 'Returns dashboard statistics' })
    async getDashboardStats() {
        // In a real app, we would filter by the authenticated provider's ID.
        // For now, we return global stats or "mocked" real stats for demonstration.

        const activePatients = await this.patientRepository.count();

        const observationsCount = await this.observationRepository.count();
        const diagnosticsCount = await this.diagnosticReportRepository.count();
        const medicationsCount = await this.medicationRequestRepository.count();
        const recordsUploaded = observationsCount + diagnosticsCount + medicationsCount;

        const pendingRequests = await this.consentRecordRepository.count({ where: { status: ConsentStatus.PENDING } });

        // For Interoperability, we can check if we have any external system connections or just return a static "Active" if everything is running.
        // Or count external references?
        // Let's just return a count of something relevant or a fixed number for now as "systems connected".
        const interoperabilityCount = 1; // e.g. connected to the blockchain

        return {
            activePatients,
            recordsUploaded,
            pendingRequests,
            interoperabilityCount,
            systemStatus: {
                blockchain: 'Connected', // Ideally check this.didService.checkHealth()
                fhirApi: 'Active',
                didService: 'Online'
            }
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
