import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import {
  Patient,
  Practitioner,
  Observation,
  DiagnosticReport,
  MedicationRequest,
  Encounter,
  ConsentRecord,
  AccessLog,
  Notification,
} from './database/entities';
import { BlockchainModule } from './blockchain/blockchain.module';
import { IdentityModule } from './identity/identity.module';
import { EncryptionModule } from './encryption/encryption.module';
import { RecordsModule } from './records/records.module';
import { ConsentModule } from './consent/consent.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const type = configService.get<string>('DATABASE_TYPE', 'postgres');
        const commonConfig = {
          entities: [
            Patient,
            Practitioner,
            Observation,
            DiagnosticReport,
            MedicationRequest,
            Encounter,
            ConsentRecord,
            AccessLog,
            Notification,
          ],
          synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE', true),
          logging: configService.get<boolean>('DATABASE_LOGGING', false),
        };

        if (type === 'sqlite') {
          return {
            type: 'sqlite',
            database: configService.get<string>('DATABASE_NAME', 'medblock.sqlite'),
            ...commonConfig,
          };
        }

        const databaseUrl = configService.get<string>('DATABASE_URL');

        // If provider handed you a CA (recommended), put it in DATABASE_SSL_CA as base64
        // If you don't have CA and want to bypass verification (dev / quick fix), the fallback below sets rejectUnauthorized:false
        const sslCaBase64 = configService.get<string>('DATABASE_SSL_CA');
        let sslOption: any = undefined;
        if (sslCaBase64) {
          const ca = Buffer.from(sslCaBase64, 'base64').toString('utf8');
          sslOption = { ca };
        } else {
          // Quick workaround for self-signed certs (not recommended for production)
          sslOption = { rejectUnauthorized: false };
        }

        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            // ensure pg receives explicit ssl options
            ssl: sslOption,
            // some drivers expect options under extra as well
            extra: {
              ssl: sslOption,
            },
            ...commonConfig,
          };
        }

        return {
          type: 'postgres',
          host: configService.get<string>('DATABASE_HOST', 'localhost'),
          port: configService.get<number>('DATABASE_PORT', 5432),
          username: configService.get<string>('DATABASE_USER', 'postgres'),
          password: configService.get<string>('DATABASE_PASSWORD', 'password'),
          database: configService.get<string>('DATABASE_NAME', 'medblock'),
          ssl: sslOption,
          extra: {
            ssl: sslOption,
          },
          ...commonConfig,
        };
      },
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    BlockchainModule,
    IdentityModule,
    EncryptionModule,
    RecordsModule,
    ConsentModule,
    NotificationsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule { }