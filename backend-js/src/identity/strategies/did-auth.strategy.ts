import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../database/entities/patient.entity';
import { Practitioner } from '../../database/entities/practitioner.entity';
import { DidService } from '../did.service';

@Injectable()
export class DidAuthStrategy extends PassportStrategy(Strategy, 'did-jwt') {
  constructor(
    private configService: ConfigService,
    private didService: DidService,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Practitioner)
    private practitionerRepository: Repository<Practitioner>,
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

    // Try to find patient first
    const patient = await this.patientRepository.findOne({
      where: { did: payload.did },
    });
    if (patient) {
      // Simplify structure if needed, or return full entity
      return patient;
    }

    // Then try practitioner
    const practitioner = await this.practitionerRepository.findOne({
      where: { did: payload.did },
    });
    if (practitioner) {
      return practitioner;
    }

    // Fallback: Verify DID still exists via service (for raw DIDs without profile?)
    const didDoc = await this.didService.resolveDid(payload.did);
    if (!didDoc) {
      throw new UnauthorizedException('DID not found');
    }

    return { did: payload.did, role: payload.role };
  }
}
