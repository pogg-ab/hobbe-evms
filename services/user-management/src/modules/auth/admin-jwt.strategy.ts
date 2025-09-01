import { Injectable, Logger } from '@nestjs/common'; // <-- IMPORT Logger
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  // --- ADD THIS LINE ---
  private readonly logger = new Logger(AdminJwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true, 
    });
  }

  // --- MODIFY THE validate() METHOD ---
  async validate(req: Request, payload: any): Promise<any> {
    // This log will tell us EVERYTHING.
    this.logger.debug('--- AdminJwtStrategy VALIDATE ---');
    this.logger.debug(`Headers: ${JSON.stringify(req.headers)}`);
    this.logger.debug(`Payload from JWT: ${JSON.stringify(payload)}`);
    this.logger.debug('--------------------------------');

    return { 
        admin_user_id: payload.sub, 
        user_name: payload.username,
        permissions: payload.permissions,
        jti: payload.jti,
        isAdmin: true,
    };
  }
}