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
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/application/services/auth.service';
import { AdminUserAuthDto } from '../dtos/create-admin-user-auth.dto';
import { AuthDto } from '../dtos/create-auth.dto';
import { PasswordResetRequestDto } from '../dtos/create-password-reset-request.dto';
import { RefreshTokenDto } from '../dtos/create-refresh-token.dto';
import { PasswordResetDto } from '../dtos/password-reset.dto';
import { ResendOtpDto } from '../dtos/resend-otp.dto';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';
import { Request, Response } from 'express';
import { createHash } from 'crypto';
import { log } from 'console';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  private readonly VALID_TOKEN_REGEX = /^[a-f0-9]{64}$/i;

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
  async requestPasswordReset(
    @Body() passwordResetRequestDto: PasswordResetRequestDto,
  ) {
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
    const { token, newPassword, confirmPassword } = passwordResetDto;

    const isResetSuccessful = await this.authService.resetPassword(
      token,
      newPassword,
      confirmPassword,
    );
    if (!isResetSuccessful) {
      throw new BadRequestException(
        'Failed to reset password. Please try again.',
      );
    }

    return { message: 'Password has been reset successfully.' };
  }

  @MessagePattern('validateUser')
  async validateJWT(@Payload() payload: any): Promise<any> {
    return await this.authService.validateJwt(payload);
  }
  @MessagePattern('validateEventUser')
  async validateEventJWT(@Payload() payload: any): Promise<any> {
    return await this.authService.validateJwt(payload);
  }

  @Get('app')
  async handlePasswordReset(
    @Query('token') token: string,
    @Res() res: Response,
    @Req() req: Request,
    @Headers('user-agent') userAgent: string
  ) {
    if (!this.validateToken(token)) {
      return res.status(400).send('Invalid or expired token');
    }

    const clientIp = this.getClientIp(req);
    const platform = this.detectPlatform(userAgent || '');
    const encodedToken = encodeURIComponent(token);

    this.logRedirectAttempt(clientIp, token, platform);

    const redirectHtml = this.buildRedirectPage(encodedToken, platform);
    res.setHeader('Content-Type', 'text/html');
    res.send(redirectHtml);
  }

  private validateToken(token: string): boolean {
    return token && this.VALID_TOKEN_REGEX.test(token);
  }

  private getClientIp(req: Request): string {
    return (
      req.ip ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.headers['x-forwarded-for']?.toString() ||
      'unknown'
    );
  }

  private detectPlatform(userAgent: string): 'ios' | 'android' | 'desktop' {
    const ua = userAgent.toLowerCase();
    if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
    if (ua.includes('android')) return 'android';
    return 'desktop';
  }

  private logRedirectAttempt(ip: string, token: string, platform: string) {
    const hashedIp = createHash('sha256').update(ip).digest('hex');
    console.log(`Redirect attempt`, {
      hashedIp,
      tokenHash: createHash('sha256').update(token).digest('hex').substring(0, 8),
      platform,
      timestamp: new Date().toISOString()
    });
  }

  private removePrefixFromDeepLink(url) {
    if (url && url.startsWith('http://89.117.37.84:4000/auth/')) {
      return url.replace('http://89.117.37.84:4000/auth/', '');
    }
    return url;
  }

  private buildRedirectPage(token: string, platform: string): string {
    const deepLinkWithPrefix = `${process.env.APP_DEEP_LINK}?token=${token}`;
    const webLink = `${process.env.WEB_RESET_LINK}?token=${token}`;
    const appStoreLink = platform === 'ios'
      ? process.env.IOS_APP_STORE_LINK
      : process.env.ANDROID_PLAY_STORE_LINK;

    const deepLink = this.removePrefixFromDeepLink(deepLinkWithPrefix);

    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecting to Hobbe EVMS</title>
    <script>
        (function() {
            const config = {
                deepLink: '${deepLink}',
                webLink: '${webLink}',
                appStoreLink: '${appStoreLink}',
                timeout: 1500,
                isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
                platform: '${platform}'
            };

            const elements = {
                spinner: document.querySelector('.spinner'),
                message: document.querySelector('.message'),
                heading: document.querySelector('.heading'),
                webButton: document.querySelector('.web-btn'),
                appButton: document.querySelector('.app-btn')
            };

            function showElement(el) {
                if (el) el.style.display = 'block';
            }

            function hideElement(el) {
                if (el) el.style.display = 'none';
            }

            function updateMessage(text) {
                if (elements.message) {
                    elements.message.textContent = text;
                    showElement(elements.message);
                }
            }

            function attemptDeepLinkRedirect() {
                const startTime = Date.now();
                
                if (config.isMobile) {
                    const opened = window.open(config.deepLink, '_blank');
                    
                    setTimeout(() => {
                      if (!opened || opened.closed || typeof opened.closed === 'undefined') {
                            updateMessage('App not found. Redirecting to browser...');
                            window.location.href = config.webLink;
                        }
                    }, config.timeout);
                } else {
                    window.location.href = config.webLink;
                }
            }

            function init() {
                hideElement(elements.message);
                if (config.platform === 'desktop') {
                    hideElement(elements.appButton);
                }
                
                if (elements.webButton) {
                    elements.webButton.addEventListener('click', function(e) {
                        e.preventDefault();
                        window.location.href = config.webLink;
                    });
                }
                
                if (elements.appButton) {
                    elements.appButton.addEventListener('click', function(e) {
                        e.preventDefault();
                        window.location.href = config.appStoreLink;
                    });
                }
                
                attemptDeepLinkRedirect();
            }

            document.addEventListener('DOMContentLoaded', init);
        })();
    </script>
    <style>
      body { font-family: Arial, sans-serif; text-align: center; padding: 2rem; }
      .spinner { 
        border: 4px solid rgba(0,0,0,0.1); 
        border-radius: 50%; 
        border-top: 4px solid #3498db;
        width: 40px; height: 40px;
        animation: spin 1s linear infinite;
        margin: 2rem auto;
      }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .btn { 
        display: inline-block;
        padding: 10px 20px;
        margin: 10px;
        border-radius: 5px;
        text-decoration: none;
        font-weight: bold;
      }
      .web-btn { background: #3498db; color: white; }
      .app-btn { background: white; color: #3498db; border: 2px solid #3498db; }
      .message { font-size: 16px; margin-top: 1rem; }
    </style>
  </head>
  <body>
    <div class="spinner"></div>
    <h2>Taking you to Hobbe EVMS...</h2>
    <div class="message" style="display: none;"></div>
    <div style="margin-top: 2rem;">
      <a href="${webLink}" class="btn web-btn">Continue in Browser</a>
      ${platform !== 'desktop' ?
        `<a href="${appStoreLink}" class="btn app-btn">Get Mobile App</a>` : ''}
    </div>
  </body>
  </html>
    `;
  }


}

