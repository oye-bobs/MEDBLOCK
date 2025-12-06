import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  Patient,
  Practitioner,
  Observation,
  DiagnosticReport,
  MedicationRequest,
  Encounter,
  ConsentRecord,
  AccessLog,
} from './database/entities';
import { BlockchainModule } from './blockchain/blockchain.module';
import { IdentityModule } from './identity/identity.module';
import { EncryptionModule } from './encryption/encryption.module';
import { RecordsModule } from './records/records.module';
import { ConsentModule } from './consent/consent.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get<string>('DATABASE_USER', 'postgres'),
        password: configService.get<string>('DATABASE_PASSWORD', 'password'),
        database: configService.get<string>('DATABASE_NAME', 'medblock'),
        entities: [
          Patient,
          Practitioner,
          Observation,
          DiagnosticReport,
          MedicationRequest,
          Encounter,
          ConsentRecord,
          AccessLog,
        ],
        synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE', true),
        logging: configService.get<boolean>('DATABASE_LOGGING', false),
      }),
      inject: [ConfigService],
    }),
    // BlockchainModule,
    IdentityModule,
    EncryptionModule,
    // RecordsModule,
    ConsentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
