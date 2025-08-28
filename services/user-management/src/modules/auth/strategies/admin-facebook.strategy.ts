import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminFacebookStrategy extends PassportStrategy(Strategy, 'admin-facebook') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('ADMIN_FACEBOOK_CLIENT_ID'),
      clientSecret: configService.get<string>('ADMIN_FACEBOOK_CLIENT_SECRET'),
      callbackURL: configService.get<string>('ADMIN_FACEBOOK_CALLBACK_URL'),
      scope: 'email',
      profileFields: ['id', 'emails', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { id, name, emails } = profile;

    // Handle cases where email might not be provided by Facebook
    if (!emails || !emails[0] || !emails[0].value) {
      return done(new Error('No primary email found for this Facebook user.'), null);
    }
    
    const adminProfile = {
      provider: 'facebook',
      id: id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
    };
    done(null, adminProfile);
  }
}