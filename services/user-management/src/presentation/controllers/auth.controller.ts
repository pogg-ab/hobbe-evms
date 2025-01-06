import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/application/services/auth.service';
import { AdminUserAuthDto } from '../dtos/create-admin-user-auth.dto';
import { AuthDto } from '../dtos/create-auth.dto';
import { RefreshTokenDto } from '../dtos/create-refresh-token.dto';
import { ResendOtpDto } from '../dtos/resend-otp.dto';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';
import { PasswordResetRequestDto } from '../dtos/create-password-reset-request.dto';
import { PasswordResetDto } from '../dtos/password-reset.dto';
     
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
    const rememberMe =
      authDto.rememberMe !== undefined ? authDto.rememberMe : false;
    return this.authService.login(user, rememberMe);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @HttpCode(200)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    const response = await this.authService.refreshAccessToken(refreshToken);

    return response;
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get authenticated user information with account details',
  })
  async getUserInfo(
    @Headers('authorization') authorization: string,
  ): Promise<any> {
    if (!authorization) {
      throw new UnauthorizedException('Authorization token is required');
    }

    const tokenParts = authorization.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid token format');
    }

    const accessToken = tokenParts[1];
    let userId: string;

    try {
      userId = await this.authService.decodeAndValidateToken(accessToken);
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return this.authService.getUserAccountInfo(userId);
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

  @Post('password-reset/request')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ type: PasswordResetRequestDto })
  @HttpCode(200)
  async requestPasswordReset(@Body() passwordResetRequestDto: PasswordResetRequestDto) {
    const { user_name } = passwordResetRequestDto;

    const result = await this.authService.requestPasswordReset(user_name);
    if (result.statusCode === HttpStatus.NOT_FOUND) {
      throw new NotFoundException('User not found.');
    }

    return { message: 'Password reset link has been sent to your email.' };
  }

  @Post('password-reset/verify/:token')
  @ApiOperation({ summary: 'Verify password reset token' })
  @HttpCode(200)
  async verifyPasswordResetToken(@Param('token') token: string) {
    const isValidToken = await this.authService.verifyPasswordResetToken(token);
    if (!isValidToken) {
      throw new BadRequestException('Invalid or expired reset token.');
    }
    return { message: 'Password reset token is valid.' };
  }

  @Post('password-reset')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiBody({ type: PasswordResetDto })
  @HttpCode(200)
  async resetPassword(@Body() passwordResetDto: PasswordResetDto) {
    const { token, newPassword } = passwordResetDto;

    const isResetSuccessful = await this.authService.resetPassword(token, newPassword);
    if (!isResetSuccessful) {
      throw new BadRequestException('Failed to reset password. Please try again.');
    }

    return { message: 'Password has been reset successfully.' };
  }

  @MessagePattern('validateUser')
  async validateJWT(@Payload() payload: any): Promise<any> {
    return await this.authService.validateJwt(payload);
  }
}
