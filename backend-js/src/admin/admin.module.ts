import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminUser, AdminLog, Patient, Practitioner, ConsentRecord, Observation, DiagnosticReport, MedicationRequest, AccessLog, Encounter, Notification } from '../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminUser,
      AdminLog,
      Patient,
      Practitioner,
      ConsentRecord,
      Observation,
      DiagnosticReport,
      MedicationRequest,
      AccessLog,
      Encounter,
      Notification
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'secret_key'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
