import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGitHubStrategy extends PassportStrategy(
  Strategy,
  'admin-github',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('ADMIN_GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('ADMIN_GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('ADMIN_GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { id, displayName, emails } = profile;
    const [firstName, lastName] = displayName
      ? displayName.split(' ')
      : ['', ''];

    if (!emails || !emails[0] || !emails[0].value) {
      return done(
        new Error('No primary email found for this GitHub user.'),
        null,
      );
    }

    const adminProfile = {
      provider: 'github',
      id: id,
      email: emails[0].value,
      firstName: firstName,
      lastName: lastName || '',
    };
    done(null, adminProfile);
  }
}
