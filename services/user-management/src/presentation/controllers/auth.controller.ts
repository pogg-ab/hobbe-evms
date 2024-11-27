import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/application/services/auth.service';
import { AdminUserAuthDto } from '../dtos/create-admin-user-auth.dto';
import { AuthDto } from '../dtos/create-auth.dto';
import { ResendOtpDto } from '../dtos/resend-otp.dto';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';

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
    if (user.statusCode === HttpStatus.NOT_FOUND) {
      throw new NotFoundException(
        'User not found. Please check your username.',
      );
    }

    if (user.statusCode === HttpStatus.UNAUTHORIZED) {
      throw new UnauthorizedException('Invalid credentials provided');
    }

    if (user.statusCode === HttpStatus.FORBIDDEN) {
      throw new ForbiddenException(
        'Your account is not verified or is inactive. Please verify your email or contact support.',
      );
    }
    return this.authService.login(user);
  }

  @Post('admin-user/login')
  @ApiOperation({ summary: 'Authenticate an admin user' })
  @ApiBody({ type: AuthDto })
  @HttpCode(200)
  async adminLogin(@Body() authDto: AdminUserAuthDto) {
    const adminUser = await this.authService.validateAdminUser(
      authDto.username,
      authDto.password,
    );

    if (adminUser.statusCode === HttpStatus.NOT_FOUND) {
      throw new NotFoundException(
        'User not found. Please check your username.',
      );
    }

    if (adminUser.statusCode === HttpStatus.UNAUTHORIZED) {
      throw new UnauthorizedException('Invalid credentials provided');
    }

    if (adminUser.statusCode === HttpStatus.FORBIDDEN) {
      throw new ForbiddenException(
        'Your account is inactive. Please contact support.',
      );
    }

    return this.authService.adminUserLogin(adminUser);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP for user registration' })
  @ApiBody({ type: VerifyOtpDto })
  @HttpCode(200)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const isValidOtp = await this.authService.verifyOTP(
      verifyOtpDto.username,
      verifyOtpDto.otp,
    );
    if (!isValidOtp) {
      throw new BadRequestException('Invalid OTP');
    }
    return { message: 'OTP verified successfully' };
  }

  @Post('resend-otp')
  @ApiOperation({ summary: 'Resend OTP to a user' })
  @ApiBody({ type: ResendOtpDto })
  @HttpCode(200)
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    const { user_name } = resendOtpDto;
    const response = await this.authService.resendOTP(user_name);
    return response;
  }

  @MessagePattern('validateUser')
  async validateJWT(@Payload() payload: any): Promise<any> {
    return await this.authService.validateJwt(payload);
  }
}
