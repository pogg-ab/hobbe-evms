import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/application/services/auth.service';
import { AuthDto } from '../dtos/create-auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Authenticate a user' })
  @ApiBody({ type: AuthDto })
  @HttpCode(200)
  async login(@Body() authDto: AuthDto) {
    const user = await this.authService.validateUser(
      authDto.username,
      authDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials provided');
    }
    return this.authService.login(user);
  }
}
