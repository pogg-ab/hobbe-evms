import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserValidationService } from 'src/application/services/live-stream/user-validation.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userValidationService: UserValidationService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any): Promise<any> {
    try {
      return await this.userValidationService.validateUser(payload);
    } catch (error) {
      console.error('Error validating JWT via Kafka:', error);
      throw new Error('Error communicating with Kafka');
    }
  }
}
