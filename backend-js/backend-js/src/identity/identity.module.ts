import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DidService } from './did.service';
import { DidAuthStrategy } from './strategies/did-auth.strategy';
import { IdentityController } from './identity.controller';
import { Patient } from '../database/entities/patient.entity';
import { Practitioner } from '../database/entities/practitioner.entity';
import { Observation } from '../database/entities/observation.entity';
import { DiagnosticReport } from '../database/entities/diagnostic-report.entity';
import { MedicationRequest } from '../database/entities/medication-request.entity';
import { ConsentRecord } from '../database/entities/consent-record.entity';
import { PatientsService } from './patients.service';
import { OtpService } from './otp.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([
      Patient,
      Practitioner,
      Observation,
      DiagnosticReport,
      MedicationRequest,
      ConsentRecord,
    ]),
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [IdentityController],
  providers: [DidService, DidAuthStrategy, PatientsService, OtpService],
  exports: [DidService, PatientsService],
})
export class IdentityModule {}
