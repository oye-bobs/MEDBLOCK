import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DidService } from './did.service';
import { DidAuthStrategy } from './strategies/did-auth.strategy';
import { IdentityController } from './identity.controller';

@Module({
    imports: [
        PassportModule,
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
    providers: [DidService, DidAuthStrategy],
    exports: [DidService],
})
export class IdentityModule { }
