import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsentService } from './consent.service';
import { ConsentController } from './consent.controller';
import { ConsentRecord, Patient, Practitioner } from '../database/entities';
import { IdentityModule } from '../identity/identity.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ConsentRecord, Patient, Practitioner]),
        IdentityModule,
    ],
    controllers: [ConsentController],
    providers: [ConsentService],
    exports: [ConsentService],
})
export class ConsentModule { }
