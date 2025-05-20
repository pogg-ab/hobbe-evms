import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { FacebookLoginCommand } from 'src/application/commands/sso/facebook-login.command';
import { User } from 'src/domain/entities/user.entity';
import { SSOResponseDto } from 'src/presentation/dtos/sso/sso-response.dto';


@CommandHandler(FacebookLoginCommand)
export class FacebookLoginHandler implements ICommandHandler<FacebookLoginCommand> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: FacebookLoginCommand): Promise<SSOResponseDto> {
    const { user } = command;
    
    // Check if user exists by Facebook ID or email
    let existingUser = await this.userRepository.findOne({
      where: [
        { facebookId: user.facebookId },
        { user_name: user.email }
      ]
    });

    if (!existingUser) {
      // Create new user if doesn't exist
      const [firstName, ...lastNameParts] = user.displayName.split(' ');
      const lastName = lastNameParts.join(' ');

      existingUser = this.userRepository.create({
        user_name: user.email,
        profile_id: user.displayName + '_' + Math.floor(Math.random() * 1000000),
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

    // Ensure we return a valid response
    const userDto = {
      email: existingUser.user_name,
      profileId: existingUser.profile_id,
      firstName: existingUser.profile_name.split(' ')[0],
      lastName: existingUser.profile_name.split(' ').slice(1).join(' '),
      googleId: existingUser.googleId || '',
      facebookId: existingUser.facebookId || user.facebookId,
      accessToken: user.accessToken,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: userDto,
    };
  }
} 