import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserValidationService } from 'src/application/services/events/user-validation.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userValidationService: UserValidationService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any): Promise<any> {
    if (payload.permissions || payload.role === 'admin') {
      return null;
    }
    try {
      const user = await this.userValidationService.validateUser(payload);

      return {
        ...user,
        isAdmin: false,
        type: 'user'
      };
    } catch (error) {
      console.error('Error validating JWT via Kafka:', error);
      return null;
    }
  }
}
