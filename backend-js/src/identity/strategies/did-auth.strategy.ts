import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DidService } from '../did.service';

@Injectable()
export class DidAuthStrategy extends PassportStrategy(Strategy, 'did-jwt') {
    constructor(
        private configService: ConfigService,
        private didService: DidService,
    ) {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: any) {
        // Payload should contain the DID
        if (!payload.did) {
            throw new UnauthorizedException('Invalid token payload');
        }

        // Verify DID still exists/is valid
        const didDoc = await this.didService.resolveDid(payload.did);
        if (!didDoc) {
            throw new UnauthorizedException('DID not found');
        }

        return { did: payload.did, role: payload.role };
    }
}
