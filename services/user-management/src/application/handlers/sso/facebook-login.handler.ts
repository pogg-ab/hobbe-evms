import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { FacebookLoginCommand } from 'src/application/commands/sso/facebook-login.command';
import { User } from 'src/domain/entities/user.entity';
import { SSOResponseDto } from 'src/presentation/dtos/sso/sso-response.dto';
import { Auth } from 'src/domain/entities/auth.entity';
import { randomInt } from 'crypto';
import { AccessToken } from 'src/domain/value-objects/access-token.value-object';

@CommandHandler(FacebookLoginCommand)
export class FacebookLoginHandler
  implements ICommandHandler<FacebookLoginCommand>
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {}

  async execute(command: FacebookLoginCommand): Promise<any> {
    const { user } = command;

    console.log('Facebook User:', user);

    // Check if user exists by Facebook ID or email
    let existingUser = await this.userRepository.findOne({
      where: [{ facebookId: user.facebookId }, { user_name: user.email }],
    });

    console.log('Existing User:', existingUser);

    if (!existingUser) {
      existingUser = this.userRepository.create({
        user_name: user.email,
        profile_id: user.displayName + randomInt(100000, 9999999),
        profile_name: user.displayName,
        facebookId: user.facebookId,
      });
      await this.userRepository.save(existingUser);
    }

    // Generate JWT token
    const payload = {
      sub: existingUser.user_id,
      email: existingUser.user_name,
    };

    const access_token = new AccessToken(
      this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1d',
      }),
    );
    let refresh_token: string | null = null;
    if (true) {
      const refreshPayload = {
        username: existingUser.user_name,
        sub: existingUser.user_id,
      };
      refresh_token = this.jwtService.sign(refreshPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '3d',
      });
    }
    const token_expires_at = true
      ? new Date(new Date().getTime() + 3 * 86400000) // 1 month expiration for refresh token
      : new Date(new Date().getTime() + 86400000);

    let auth = await this.authRepository.findOne({
      where: { user_id: existingUser.user_id },
    });

    if (auth) {
      auth.user_id = existingUser.user_id;
      auth.access_token = access_token.toString();
      auth.refresh_token = refresh_token ? refresh_token.toString() : '';
      auth.token_expires_at = token_expires_at;
      auth.last_login = new Date();

      await this.authRepository.save(auth);
    } else {
      auth = new Auth();
      auth.user_id = existingUser.user_id;
      auth.access_token = access_token.toString();
      auth.refresh_token = refresh_token ? refresh_token.toString() : '';
      auth.token_expires_at = token_expires_at;
      auth.last_login = new Date();

      await this.authRepository.save(auth);
    }
    return {
      access_token: access_token.toString(),
      ...(refresh_token && { refresh_token: refresh_token.toString() }),
    };
  }
}
