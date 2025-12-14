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
        // Use DATABASE_SSL=true to explicitly opt into SSL handling when using DATABASE_URL
        const envSsl = configService.get<string>('DATABASE_SSL') || '';
        const useSsl = databaseUrl
          ? (envSsl.toLowerCase() === 'true' || /sslmode|ssl=true/i.test(databaseUrl))
          : false;

        // If you have a custom CA, provide it as base64 in DATABASE_CA (recommended for production):
        // export DATABASE_CA="$(cat ca.crt | base64 -w0)"
        const databaseCaBase64 = configService.get<string>('DATABASE_CA');
        let sslOptions: any = undefined;
        if (useSsl) {
          sslOptions = {
            // default: do not reject unauthorized only if explicitly requested or no CA provided
            rejectUnauthorized: true,
          };

          if (databaseCaBase64) {
            try {
              sslOptions.ca = Buffer.from(databaseCaBase64, 'base64').toString();
              // If you supply a CA, keep rejectUnauthorized = true (secure)
              sslOptions.rejectUnauthorized = true;
            } catch (e) {
              // If CA parsing fails, fall back to not rejecting (less secure)
              sslOptions.rejectUnauthorized = false;
            }
          } else if (configService.get<string>('DATABASE_ALLOW_SELF_SIGNED', 'false').toLowerCase() === 'true') {
            // Explicit opt-in to accept self-signed certs (less secure)
            sslOptions.rejectUnauthorized = false;
          } else {
            // If no CA and no explicit allowance, disable verification to avoid crash on many managed DB providers
            // you can change this behavior by setting DATABASE_ALLOW_SELF_SIGNED=true or supply DATABASE_CA
            sslOptions.rejectUnauthorized = false;
          }
        }

        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            // pass ssl both top-level and in extra to cover different TypeORM/pg versions
            ssl: useSsl ? sslOptions : false,
            extra: {
              ssl: useSsl ? sslOptions : false,
            },
            ...commonConfig,
          };
        }

        // non-URL connection
        return {
          type: 'postgres',
          host: configService.get<string>('DATABASE_HOST', 'localhost'),
          port: configService.get<number>('DATABASE_PORT', 5432),
          username: configService.get<string>('DATABASE_USER', 'postgres'),
          password: configService.get<string>('DATABASE_PASSWORD', 'password'),
          database: configService.get<string>('DATABASE_NAME', 'medblock'),
          ssl: useSsl ? sslOptions : false,
          extra: {
            ssl: useSsl ? sslOptions : false,
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
export class AppModule {}