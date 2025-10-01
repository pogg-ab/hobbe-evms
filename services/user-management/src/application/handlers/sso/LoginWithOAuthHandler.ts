import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomInt } from 'crypto';
import { LoginWithOAuthCommand } from 'src/application/commands/sso/LoginWithOAuthCommand';
import { Auth } from 'src/domain/entities/auth.entity';
import { OAuthProvider } from 'src/domain/entities/oauth-provider.entity';
import { User } from 'src/domain/entities/user.entity';
import { AccessToken } from 'src/domain/value-objects/access-token.value-object';
import { Repository } from 'typeorm';

@CommandHandler(LoginWithOAuthCommand)
export class LoginWithOAuthHandler
  implements ICommandHandler<LoginWithOAuthCommand>
{
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(OAuthProvider)
    private readonly providerRepo: Repository<OAuthProvider>,
    private readonly jwtService: JwtService,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {}

  async execute(command: LoginWithOAuthCommand): Promise<any> {
    const { provider, providerId, email, name, accessToken, refreshToken } =
      command.dto;

    let providerAccount = await this.providerRepo.findOne({
      where: { provider, providerId },
      relations: ['user'],
    });

    let user = await this.userRepo.findOne({
      where: { user_name: email },
      relations: ['providers'],
    });

    if (!user) {
      user = this.userRepo.create({
        user_name: email,
        profile_id: name + '_ ' + randomInt(100000, 9999999),
        profile_name: name,
      });
      await this.userRepo.save(user);
    }

    if (!providerAccount) {
      const newProvider = this.providerRepo.create({
        provider,
        providerId,
        accessToken,
        refreshToken,
        user,
      });
      await this.providerRepo.save(newProvider);
    }

    const payload = {
      sub: user.user_id,
      email: user.user_name,
    };

    const access_token = new AccessToken(
      this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1d',
      }),
    );

    let refresh_token: string | null = null;
    if (true) {
      const refreshPayload = { username: user.user_name, sub: user.user_id };
      refresh_token = this.jwtService.sign(refreshPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '3d',
      });
    }
    const token_expires_at = true
      ? new Date(new Date().getTime() + 3 * 86400000) // 1 month expiration for refresh token
      : new Date(new Date().getTime() + 86400000);

    let auth = await this.authRepository.findOne({
      where: { user_id: user.user_id },
    });

    if (auth) {
      auth.user_id = user.user_id;
      auth.access_token = access_token.toString();
      auth.refresh_token = refresh_token ? refresh_token.toString() : '';
      auth.token_expires_at = token_expires_at;
      auth.last_login = new Date();

      await this.authRepository.save(auth);
    } else {
      auth = new Auth();
      auth.user_id = user.user_id;
      auth.access_token = access_token.toString();
      auth.refresh_token = refresh_token ? refresh_token.toString() : '';
      auth.token_expires_at = token_expires_at;
      auth.last_login = new Date();

      await this.authRepository.save(auth);
    }

    return {
      //   user: user,
      access_token: access_token.toString(),
      ...(refresh_token && { refresh_token: refresh_token.toString() }),
    };
  }
}
