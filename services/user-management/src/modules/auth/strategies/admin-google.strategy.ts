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
    
    // --- START: ADD THESE DEBUGGING LOGS ---
    console.log('--- Inside AdminGoogleStrategy validate() ---');
    console.log('Received profile from Google:', JSON.stringify(profile, null, 2));
    // --- END: ADD THESE DEBUGGING LOGS ---

    const { id, name, emails } = profile;

    // This is a defensive check to prevent crashes if the email is missing
    if (!emails || !emails[0] || !emails[0].value) {
      console.error('CRITICAL: No email found in Google profile.');
      return done(new Error('No email found in Google profile.'), null);
    }

    const adminProfile = {
      provider: 'google',
      id: id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
    };

    console.log('Successfully created adminProfile:', adminProfile);
    console.log('--- Exiting AdminGoogleStrategy validate() ---');

    done(null, adminProfile);
  }
}