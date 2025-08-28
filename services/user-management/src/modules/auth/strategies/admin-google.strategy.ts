import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGoogleStrategy extends PassportStrategy(Strategy, 'admin-google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('ADMIN_GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('ADMIN_GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('ADMIN_GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails } = profile;
    // We create a clean profile object to pass to our AuthService.
    const adminProfile = {
      provider: 'google',
      id: id, // This is the ssoProviderId
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
    };
    done(null, adminProfile);
  }
}