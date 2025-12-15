import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class DidAuthGuard extends AuthGuard('did-jwt') {}
