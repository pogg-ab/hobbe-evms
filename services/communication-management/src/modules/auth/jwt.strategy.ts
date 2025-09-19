import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // This validate method is very simple. It just returns the decoded payload.
  // We trust that if the signature is valid, the user-management service
  // has already done the heavy lifting of checking the user's status.
  async validate(payload: any): Promise<any> {
    // We return the entire payload so that our controllers can access the 'sub' (user ID)
    return payload;
  }
}