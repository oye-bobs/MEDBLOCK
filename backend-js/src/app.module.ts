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
  AdminUser,
  AdminLog,
  Report,
} from './database/entities';
import { BlockchainModule } from './blockchain/blockchain.module';
import { IdentityModule } from './identity/identity.module';
import { EncryptionModule } from './encryption/encryption.module';
import { RecordsModule } from './records/records.module';
import { ConsentModule } from './consent/consent.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { ReportsModule } from './reports/reports.module';

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
            AdminUser,
            AdminLog,
            Report,
          ],
          synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE', true),
          logging: configService.get<boolean>('DATABASE_LOGGING', false),
        };

        
        if (type === 'sqlite') {
          return {
            type: 'sqlite',
            database: configService.get<string>(
              'DATABASE_NAME',
              'medblock.sqlite',
            ),
            ...commonConfig,
          };
        }

        let databaseUrl = configService.get<string>('DATABASE_URL');
        if (databaseUrl) {
          // Handle quoted strings which can happen in some environments like Render/Railway
          if (databaseUrl.startsWith('"') && databaseUrl.endsWith('"')) {
            databaseUrl = databaseUrl.slice(1, -1);
          }

          // Remove SSL parameters from the URL as we'll set them explicitly
          // This prevents conflicts with Railway's default SSL settings
          databaseUrl = databaseUrl.replace(/[?&]sslmode=[^&]*/g, '');
          databaseUrl = databaseUrl.replace(/[?&]ssl=[^&]*/g, '');

          return {
            type: 'postgres',
            url: databaseUrl,
            ssl: {
              rejectUnauthorized: false,
            },
            extra: {
              ssl: {
                rejectUnauthorized: false,
              },
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
          ssl: {
            rejectUnauthorized: false,
          },
          extra: {
            ssl: {
              rejectUnauthorized: false,
            },
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
    AdminModule,
    ReportsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
