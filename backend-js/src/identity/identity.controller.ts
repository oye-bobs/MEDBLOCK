import { Controller, Post, Body, Get, Param, UseGuards, Request, Query, Patch } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
import { PatientsService } from './patients.service';

@ApiTags('identity')
@Controller('identity')
export class IdentityController {
    constructor(
        private didService: DidService,
        private jwtService: JwtService,
        private patientsService: PatientsService,
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
    @UseGuards(DidAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Search patients by name, DID, or other attributes' })
    @ApiResponse({ status: 200, description: 'Returns matching patients (Paginated)' })
    async searchPatients(
        @Query('query') query: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        if (!query) {
            return { data: [], meta: { total: 0, page, limit } };
        }

        const normalizedQuery = query.toLowerCase().trim();
        const skip = (page - 1) * limit;

        const [patients, total] = await this.patientRepository
            .createQueryBuilder('patient')
            // Match DID
            .where('LOWER(patient.did) LIKE :query', { query: `%${normalizedQuery}%` })
            // Match Name (searching inside the JSON string)
            .orWhere('LOWER(CAST(patient.name AS TEXT)) LIKE :query', { query: `%${normalizedQuery}%` })
            // Match Telecom (email, phone)
            .orWhere('LOWER(CAST(patient.telecom AS TEXT)) LIKE :query', { query: `%${normalizedQuery}%` })
            // Match Wallet Address
            .orWhere('LOWER(patient.walletAddress) LIKE :query', { query: `%${normalizedQuery}%` })
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        // Sanitize results: Return only identity info, hide contact details (PII)
        const sanitized = patients.map(p => ({
            did: p.did,
            name: p.name,
            gender: p.gender,
            birthDate: p.birthDate,
            // PII excluded
        }));

        return {
            data: sanitized,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    @Get('patient/:did')
    @UseGuards(DidAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get patient details by DID' })
    @ApiResponse({ status: 200, description: 'Patient found' })
    async getPatient(@Param('did') did: string, @Request() req) {
        // 1. If requesting own profile
        if (req.user.did === did) {
            const patient = await this.patientRepository.findOne({ where: { did } });
            if (!patient) {
                throw new Error('Patient not found');
            }
            return patient;
        }

        // 2. If provider (or other), check for consent/access permissions
        // This service method throws Forbidden if no access
        return this.patientsService.getPatientByDidForProvider(did, req.user.did);
    }

    @Get('provider/patients')
    @UseGuards(DidAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all patients accessible to the authenticated provider' })
    @ApiResponse({ status: 200, description: 'Returns patients with active consent' })
    async getProviderPatients(@Request() req) {
        return this.patientsService.getProviderPatients(req.user.did);
    }

    @Get('provider/patient/:did')
    @UseGuards(DidAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a specific patient by DID (requires active consent)' })
    @ApiResponse({ status: 200, description: 'Patient found and accessible' })
    async getPatientByDidForProvider(@Param('did') did: string, @Request() req) {
        return this.patientsService.getPatientByDidForProvider(did, req.user.did);
    }

    @Get('provider/patient/:did/access')
    @UseGuards(DidAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Check if provider has access to a specific patient' })
    @ApiResponse({ status: 200, description: 'Returns access status' })
    async checkPatientAccess(@Param('did') did: string, @Request() req) {
        const hasAccess = await this.patientsService.hasProviderAccess(did, req.user.did);
        return { hasAccess, patientDid: did };
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
    @UseGuards(DidAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get provider dashboard stats' })
    @ApiResponse({ status: 200, description: 'Returns dashboard statistics' })
    async getDashboardStats(@Request() req) {
        const providerDid = req.user.did;

        // Get the provider entity
        const provider = await this.practitionerRepository.findOne({ where: { did: providerDid } });
        if (!provider) {
            throw new Error('Provider not found');
        }

        // Count active patients (those with active consent for this provider)
        const activePatients = await this.consentRecordRepository.count({
            where: {
                practitioner: { id: provider.id },
                status: ConsentStatus.ACTIVE
            }
        });

        // Get all patient IDs with active consent for this provider
        const activeConsents = await this.consentRecordRepository.find({
            where: {
                practitioner: { id: provider.id },
                status: ConsentStatus.ACTIVE
            },
            relations: ['patient']
        });

        const patientIds = activeConsents.map(c => c.patient.id);

        // Count records only for patients this provider has consent for
        let recordsUploaded = 0;
        if (patientIds.length > 0) {
            const observationsCount = await this.observationRepository.count({
                where: { patient: { id: In(patientIds) } }
            });
            const diagnosticsCount = await this.diagnosticReportRepository.count({
                where: { patient: { id: In(patientIds) } }
            });
            const medicationsCount = await this.medicationRequestRepository.count({
                where: { patient: { id: In(patientIds) } }
            });
            recordsUploaded = observationsCount + diagnosticsCount + medicationsCount;
        }

        // Count pending requests for this provider only
        const pendingRequests = await this.consentRecordRepository.count({
            where: {
                practitioner: { id: provider.id },
                status: ConsentStatus.PENDING
            }
        });

        const interoperabilityCount = activePatients; // Number of active patient connections

        return {
            activePatients,
            recordsUploaded,
            pendingRequests,
            interoperabilityCount,
            systemStatus: {
                blockchain: 'Connected',
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

    @Patch('provider/profile')
    @UseGuards(DidAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update provider profile' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully' })
    async updateProviderProfile(@Request() req, @Body() body: any) {
        const provider = await this.practitionerRepository.findOne({ where: { did: req.user.did } });
        if (!provider) {
            throw new Error('Provider not found');
        }

        // Update fields if provided
        // Update fields if provided (check for undefined to allow clearing values)
        if (body.fullName !== undefined) {
            provider.name = [{ text: body.fullName }];
        }
        if (body.email !== undefined) {
            // Update telecom email
            const otherTelecoms = provider.telecom?.filter((t: any) => t.system !== 'email') || [];
            if (body.email) {
                provider.telecom = [...otherTelecoms, { system: 'email', value: body.email }];
            } else {
                provider.telecom = otherTelecoms;
            }
        }
        
        if (body.hospitalName !== undefined || body.hospitalType !== undefined) {
            provider.meta = {
                ...provider.meta,
            };
            
            if (body.hospitalName !== undefined) {
                provider.meta.hospitalName = body.hospitalName;
            }
            
            if (body.hospitalType !== undefined) {
                provider.meta.hospitalType = body.hospitalType;
            }
        }

        if (body.specialty !== undefined) {
            if (provider.qualification && provider.qualification.length > 0) {
                provider.qualification[0].display = body.specialty;
            } else {
                provider.qualification = [{ display: body.specialty }] as any;
            }
        }

        return this.practitionerRepository.save(provider);
    }

    @Patch('patient/profile')
    @UseGuards(DidAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update patient profile' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully' })
    async updatePatientProfile(@Request() req, @Body() body: any) {
        const patient = await this.patientRepository.findOne({ where: { did: req.user.did } });
        if (!patient) {
            throw new Error('Patient not found');
        }

        // Update fields if provided
        if (body.name) {
            // Handle simple name update or complex FHIR structure
            if (typeof body.name === 'string') {
                // Update first name entry text
                if (!patient.name) patient.name = [];
                if (patient.name.length > 0) {
                    patient.name[0].text = body.name;
                    // If we want to try and parse given/family, we could, but text is safer for simple update
                } else {
                    patient.name.push({ text: body.name });
                }
            } else if (Array.isArray(body.name)) {
                patient.name = body.name;
            }
            // Specific fields from frontend form: firstName, lastName
            if (body.firstName || body.lastName) {
                if (!patient.name) patient.name = [{}];
                if (!patient.name[0]) patient.name[0] = {};

                const currentName = patient.name[0];
                if (body.firstName) currentName.given = [body.firstName];
                if (body.lastName) currentName.family = body.lastName;
                // Reconstruct text
                currentName.text = `${currentName.given?.[0] || ''} ${currentName.family || ''}`.trim();
            }
        }

        if (body.gender) patient.gender = body.gender;
        if (body.birthDate) patient.birthDate = new Date(body.birthDate);

        if (body.email || body.phone) {
            if (!patient.telecom) patient.telecom = [];

            if (body.email) {
                const existingEmail = patient.telecom.find((t: any) => t.system === 'email');
                if (existingEmail) existingEmail.value = body.email;
                else patient.telecom.push({ system: 'email', value: body.email });
            }

            if (body.phone) {
                const existingPhone = patient.telecom.find((t: any) => t.system === 'phone');
                if (existingPhone) existingPhone.value = body.phone;
                else patient.telecom.push({ system: 'phone', value: body.phone });
            }
        }

        if (body.address) {
            if (typeof body.address === 'string') {
                // Simple text address
                if (!patient.address) patient.address = [{}];
                if (!patient.address[0]) patient.address[0] = {};
                patient.address[0].text = body.address;
            }
        }

        return this.patientRepository.save(patient);
    }
}
