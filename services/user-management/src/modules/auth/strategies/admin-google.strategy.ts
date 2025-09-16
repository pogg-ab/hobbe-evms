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
      passReqToCallback: false,
    });
    
    // Log strategy configuration (mask sensitive data in production)
    console.log('AdminGoogleStrategy configured with:', {
      clientID: configService.get<string>('ADMIN_GOOGLE_CLIENT_ID') ? '***SET***' : 'MISSING',
      callbackURL: configService.get<string>('ADMIN_GOOGLE_CALLBACK_URL'),
      hasClientSecret: !!configService.get<string>('ADMIN_GOOGLE_CLIENT_SECRET')
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      console.log('--- AdminGoogleStrategy.validate() START ---');
      console.log('Access Token received:', accessToken ? '***PRESENT***' : 'MISSING');
      console.log('Refresh Token received:', refreshToken ? '***PRESENT***' : 'MISSING');
      console.log('Raw profile structure:', Object.keys(profile));
      console.log('Profile ID:', profile.id);
      console.log('Profile emails:', profile.emails);
      console.log('Profile name:', profile.name);
      console.log('Profile displayName:', profile.displayName);
      console.log('Profile provider:', profile.provider);

      // Validate profile structure
      if (!profile || typeof profile !== 'object') {
        console.error('Invalid profile received:', profile);
        return done(new Error('Invalid profile received from Google'), null);
      }

      const { id, name, emails, photos, displayName } = profile;

      // Validate required fields
      if (!id) {
        console.error('Missing Google ID in profile');
        return done(new Error('Missing Google ID in profile'), null);
      }

      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        console.error('No emails found in Google profile');
        return done(new Error('No email found in Google profile'), null);
      }

      const primaryEmail = emails[0].value;
      if (!primaryEmail) {
        console.error('Empty email value in Google profile');
        return done(new Error('Empty email value in Google profile'), null);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(primaryEmail)) {
        console.error('Invalid email format:', primaryEmail);
        return done(new Error('Invalid email format received from Google'), null);
      }

      // Build admin profile object
      const adminProfile = {
        provider: 'google',
        id: id,
        email: primaryEmail.toLowerCase().trim(), // Normalize email
        firstName: name?.givenName?.trim() || '',
        lastName: name?.familyName?.trim() || '',
        displayName: displayName?.trim() || '',
        photo: photos && photos[0] ? photos[0].value : null,
        accessToken: accessToken,
        refreshToken: refreshToken,
        rawProfile: profile // Include raw profile for debugging
      };

      console.log('Processed admin profile:', {
        provider: adminProfile.provider,
        id: adminProfile.id,
        email: adminProfile.email,
        firstName: adminProfile.firstName,
        lastName: adminProfile.lastName
      });

      console.log('--- AdminGoogleStrategy.validate() END ---');

      // Successfully validated
      done(null, adminProfile);

    } catch (error) {
      console.error('Unexpected error in AdminGoogleStrategy.validate():', error);
      console.error('Error stack:', error.stack);
      
      // Pass the error to Passport
      done(error, null);
    }
  }

  /**
   * Optional: Override authentication parameters if needed
   */
  authorizationParams(): { [key: string]: string } {
    return {
      access_type: 'offline',
      prompt: 'consent', // Force consent screen to ensure refresh token
      include_granted_scopes: 'true'
    };
  }

  /**
   * Optional: Override token params if needed
   */
  tokenParams(): { [key: string]: any } {
    return {
      grant_type: 'authorization_code'
    };
  }

  /**
   * Optional: Custom user profile parsing
   */
  userProfile(accessToken: string, done: (err?: Error, profile?: any) => void) {
    // You can override this method for custom profile parsing
    this._oauth2.get('https://www.googleapis.com/oauth2/v3/userinfo', accessToken, (err, body) => {
      if (err) {
        console.error('Error fetching user profile from Google:', err);
        return done(new Error(typeof err === 'string' ? err : (err?.data ? JSON.stringify(err.data) : JSON.stringify(err))));
      }
      
      try {
        const json = JSON.parse(body as string);
        console.log('Raw user profile from Google API:', json);
        done(null, json);
      } catch (parseError) {
        console.error('Error parsing user profile JSON:', parseError);
        done(parseError);
      }
    });
  }
}