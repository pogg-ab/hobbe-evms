import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { GoogleLoginCommand } from 'src/application/commands/sso/google-login.command';
import { User } from 'src/domain/entities/user.entity';
import { SSOResponseDto } from 'src/presentation/dtos/sso/sso-response.dto';
import { randomInt } from 'crypto';
import { AuthService } from 'src/application/services/auth.service';
import { Auth } from 'src/domain/entities/auth.entity';
import { AccessToken } from 'src/domain/value-objects/access-token.value-object';


@CommandHandler(GoogleLoginCommand)
export class GoogleLoginHandler implements ICommandHandler<GoogleLoginCommand> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {}

  async execute(command: GoogleLoginCommand): Promise<any> {
    const { user } = command;
    
    // Check if user exists by Google ID or email
    let existingUser = await this.userRepository.findOne({
      where: [
        { googleId: user.googleId },
        { user_name: user.email }
      ]
    });

    if (!existingUser) {
      // Create new user if doesn't exist
      existingUser = this.userRepository.create({
        user_name: user.email,
        profile_id: user.firstName+'_'+ user.lastName+'_' + randomInt(100000, 9999999),
        profile_name: user.firstName + ' ' + user.lastName,
        googleId: user.googleId,
      });
      await this.userRepository.save(existingUser);
    }

    // Generate JWT token
    const payload = { 
      sub: existingUser.user_id,
      email: existingUser.user_name,
    };

    // Ensure we return a valid GoogleUserDto
    // const userDto = {
    //   email: existingUser.user_name,
    //   firstName: existingUser.profile_name.split(' ')[0],
    //   lastName: existingUser.profile_name.split(' ')[1],
    //   googleId: existingUser.googleId || user.googleId,
    //   accessToken: user.accessToken,
    // };

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