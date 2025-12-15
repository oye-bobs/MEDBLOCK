import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordsService } from './records.service';
import { RecordsController } from './records.controller';
import {
  Observation,
  DiagnosticReport,
  MedicationRequest,
  Encounter,
  Patient,
  Practitioner,
  ConsentRecord,
  AccessLog,
} from '../database/entities';
import { IdentityModule } from '../identity/identity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Observation,
      DiagnosticReport,
      MedicationRequest,
      Encounter,
      Patient,
      Practitioner,
      ConsentRecord,
      AccessLog,
    ]),
    IdentityModule,
  ],
  controllers: [RecordsController],
  providers: [RecordsService],
})
export class RecordsModule {}
