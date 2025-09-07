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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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

import { AuthGuard } from '@nestjs/passport';
import { CommandBus } from '@nestjs/cqrs';
import { OAuthLoginDto, Provider } from '../dtos/sso/oauth.dto';
import { LoginWithOAuthCommand } from 'src/application/commands/sso/LoginWithOAuthCommand';
import { CreateGuestSessionDto } from '../dtos/Guest User Insight/create-guest-session.dto';
import { UpgradeGuestDto } from '../dtos/Guest User Insight/upgrade-guest.dto';
import { GuestUserService } from 'src/application/services/guest-user.service';
import { SessionID } from 'src/domain/value-objects/session-id.value-object';
import { UserID } from 'src/domain/value-objects/user-id.value-object';
import { AuditLogInterceptor } from '../interceptors/audit-log.interceptor';
import { UniversalAuthGuard } from '../guards/universal-auth.guard';
import { SessionGuard } from '../guards/session.guard';
import { Public } from '../decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { MfaLoginDto } from '../dtos/mfa-login.dto';
import { AdminAuthGuard } from '../guards/admin-auth.guard';


@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(AuditLogInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly commandBus: CommandBus,
    private readonly guestUserService: GuestUserService,
    private readonly configService: ConfigService,
  ) { }
  private readonly VALID_TOKEN_REGEX = /^[a-f0-9]{64}$/i;

  async oauthLogin(@Body() dto: OAuthLoginDto) {
    return await this.commandBus.execute(new LoginWithOAuthCommand(dto));
  }

  @ApiOperation({ summary: 'Redirects to Google OAuth2 consent screen' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google OAuth2 consent screen',
  })
  @Get('google')
  @ApiOperation({
    summary: 'Initiates Google OAuth login with dynamic redirect',
  })
  async googleAuth(@Req() req: Request, @Res() res: Response) {
    const { redirect_uri } = req.query;

    if (!redirect_uri) {
      return res.status(400).send('Missing redirect query');
    }

    const state = encodeURIComponent(redirect_uri as string); // secure encode
    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}` +
      `&response_type=code` +
      `&scope=email profile` +
      `&state=${state}`;

    return res.redirect(authUrl);
  }

  @ApiOperation({ summary: 'Handles Google OAuth2 callback' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to success page with JWT token',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired Google token',
  })
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const { state } = req.query;
    const redirect = decodeURIComponent(state as string); // from step 1

    const data: OAuthLoginDto = {
      provider: Provider.Google,
      providerId: req.user.googleId,
      email: req.user.email,
      name: `${req.user.firstName} ${req.user.lastName}`,
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken,
    };

    const result = await this.oauthLogin(data);

    const redirectUrl = new URL(redirect);
    redirectUrl.searchParams.set('token', result.access_token);

    return res.redirect(redirectUrl.toString());
  }

  @Get('success')
  @ApiOperation({ summary: 'Handles successful Google login' })
  @ApiResponse({
    status: 200,
    description: 'Successful login with JWT token',
  })
  async googleLoginSuccess(@Query('token') token: string) {
    return { message: 'Login successful', token };
  }

  @ApiOperation({ summary: 'Redirects to Facebook OAuth2 consent screen' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Facebook OAuth2 consent screen',
  })
  @Get('facebook')
  @ApiOperation({
    summary: 'Initiates Facebook OAuth login with dynamic redirect',
  })
  async facebookAuth(@Req() req: Request, @Res() res: Response) {
    const { redirect_uri } = req.query;

    if (!redirect_uri) {
      return res.status(400).send('Missing redirect_uri query');
    }

    const state = encodeURIComponent(redirect_uri as string);

    const authUrl =
      `https://www.facebook.com/v19.0/dialog/oauth?` +
      `client_id=${process.env.FACEBOOK_CLIENT_ID}` +
      `&redirect_uri=${process.env.FACEBOOK_CALLBACK_URL}` +
      `&state=${state}` +
      `&response_type=code` +
      `&scope=email,public_profile`;

    return res.redirect(authUrl);
  }

  @Get('facebook/callback')
  @ApiOperation({ summary: 'Handles Facebook OAuth2 callback and redirects' })
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthCallback(@Req() req, @Res() res: Response) {
    if (!req.user) {
      throw new UnauthorizedException('Invalid or expired Facebook token');
    }

    const { state } = req.query;
    const redirect = decodeURIComponent(state as string);
    const data: OAuthLoginDto = {
      provider: Provider.Facebook,
      providerId: req.user.facebookId,
      email: req.user.email,
      name: req.user.displayName,
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken,
    };

    const result = await this.oauthLogin(data);

    const redirectUrl = new URL(redirect);
    redirectUrl.searchParams.set('token', result.access_token);

    return res.redirect(redirectUrl.toString());
  }

  @Get('github')
  @ApiOperation({
    summary: 'Initiates GitHub OAuth login with dynamic redirect',
  })
  async githubAuth(@Req() req: Request, @Res() res: Response) {
    const { redirect_uri } = req.query;

    if (!redirect_uri) {
      return res.status(400).send('Missing redirect_uri query');
    }


    const state = encodeURIComponent(redirect_uri as string);

    const authUrl =
      `https://github.com/login/oauth/authorize?` +
      `client_id=${process.env.GITHUB_CLIENT_ID}` +
      `&redirect_uri=${process.env.GITHUB_CALLBACK_URL}` +
      `&scope=user:email` +
      `&state=${state}`;

    return res.redirect(authUrl);
  }

  @Get('github/callback')
  @ApiOperation({ summary: 'Handles GitHub OAuth2 callback and redirects' })
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req, @Res() res: Response) {
    if (!req.user) {
      throw new UnauthorizedException('Invalid or expired GitHub token');
    }

    const { state } = req.query;
    const redirect = decodeURIComponent(state as string);

    const data: OAuthLoginDto = {
      provider: Provider.GitHub,
      providerId: req.user.githubId,
      email: req.user.email,
      name: req.user.displayName,
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken,
    };
    const result = await this.oauthLogin(data);
    const redirectUrl = new URL(redirect);
    redirectUrl.searchParams.set('token', result.access_token);
    return res.redirect(redirectUrl.toString());
  }

  @ApiOperation({ summary: 'Shows authentication success page' })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful message',
  })
  @Get('success')
  async authSuccess(@Req() req, @Res() res: Response) {
    // This endpoint can be used to show a success page or handle the token
    res.send('Authentication successful! You can close this window.');
  }

  
  // --- ADMIN GOOGLE SSO ENDPOINTS ---
@Get('admin/google')
@Public()
@ApiOperation({ summary: 'Initiates Google SSO for Admins (manual redirect)' })
async adminGoogleAuth(@Req() req: Request, @Res() res: Response) {
    const { redirect_uri } = req.query;
    if (!redirect_uri) {
        return res.status(400).send('Missing redirect_uri query parameter.');
    }
    const state = encodeURIComponent(redirect_uri as string);
    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.ADMIN_GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${process.env.ADMIN_GOOGLE_CALLBACK_URL}` +
      `&response_type=code` +
      `&scope=email profile` +
      `&state=${state}`;
    return res.redirect(authUrl);
}

@Get('admin/google/callback')
@Public()
@UseGuards(AuthGuard('admin-google'))
@ApiOperation({ summary: 'Handles Google SSO callback for Admins' })
async adminGoogleAuthCallback(@Req() req, @Res() res: Response) {
    const { state } = req.query;
    const frontendRedirectUrl = decodeURIComponent(state as string);
    const tokens = await this.authService.validateAndLoginAdminWithSso(req, req.user);
    const finalRedirectUrl = new URL(frontendRedirectUrl);
    finalRedirectUrl.searchParams.set('token', tokens.access_token);
    return res.redirect(finalRedirectUrl.toString());
}


// --- ADMIN FACEBOOK SSO ENDPOINTS ---
@Get('admin/facebook')
@Public()
@ApiOperation({ summary: 'Initiates Facebook SSO for Admins (manual redirect)' })
async adminFacebookAuth(@Req() req: Request, @Res() res: Response) {
    const { redirect_uri } = req.query;
    if (!redirect_uri) {
        return res.status(400).send('Missing redirect_uri query parameter.');
    }
    const state = encodeURIComponent(redirect_uri as string);
    const authUrl =
      `https://www.facebook.com/v19.0/dialog/oauth?` +
      `client_id=${process.env.ADMIN_FACEBOOK_CLIENT_ID}` +
      `&redirect_uri=${process.env.ADMIN_FACEBOOK_CALLBACK_URL}` +
      `&state=${state}` +
      `&response_type=code` +
      `&scope=email`;
    return res.redirect(authUrl);
}

@Get('admin/facebook/callback')
@Public()
@UseGuards(AuthGuard('admin-facebook'))
@ApiOperation({ summary: 'Handles Facebook SSO callback for Admins' })
async adminFacebookAuthCallback(@Req() req, @Res() res: Response) {
    const { state } = req.query;
    const frontendRedirectUrl = decodeURIComponent(state as string);
    const tokens = await this.authService.validateAndLoginAdminWithSso(req, req.user);
    const finalRedirectUrl = new URL(frontendRedirectUrl);
    finalRedirectUrl.searchParams.set('token', tokens.access_token);
    return res.redirect(finalRedirectUrl.toString());
}


// ---  ADMIN GITHUB SSO ENDPOINTS ---
@Get('admin/github')
@Public()
@ApiOperation({ summary: 'Initiates GitHub SSO for Admins (manual redirect)' })
async adminGitHubAuth(@Req() req: Request, @Res() res: Response) {
    const { redirect_uri } = req.query;
    if (!redirect_uri) {
        return res.status(400).send('Missing redirect_uri query parameter.');
    }
    const state = encodeURIComponent(redirect_uri as string);
    const authUrl =
      `https://github.com/login/oauth/authorize?` +
      `client_id=${process.env.ADMIN_GITHUB_CLIENT_ID}` +
      `&redirect_uri=${process.env.ADMIN_GITHUB_CALLBACK_URL}` +
      `&scope=user:email` +
      `&state=${state}`;
    return res.redirect(authUrl);
}

@Get('admin/github/callback')
@Public()
@UseGuards(AuthGuard('admin-github'))
@ApiOperation({ summary: 'Handles GitHub SSO callback for Admins' })
async adminGitHubAuthCallback(@Req() req, @Res() res: Response) {
    const { state } = req.query;
    const frontendRedirectUrl = decodeURIComponent(state as string);
    const tokens = await this.authService.validateAndLoginAdminWithSso(req, req.user);
    const finalRedirectUrl = new URL(frontendRedirectUrl);
    finalRedirectUrl.searchParams.set('token', tokens.access_token);
    return res.redirect(finalRedirectUrl.toString());
}
   @Post('mfa-login')
  @Public() // It's public because the user isn't fully logged in yet
  @HttpCode(200)
  @ApiOperation({ summary: 'Step 2 (Verification Flow): Verify MFA code and get final tokens' })
  @ApiBody({ type: MfaLoginDto })
  async mfaLogin(@Req() req: Request, @Body() mfaLoginDto: MfaLoginDto) {
    return this.authService.verifyMfaAndLogin(
      req,
      mfaLoginDto.interimToken,
      mfaLoginDto.mfaCode,
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate a user' })
  @ApiBody({ type: AuthDto })
  @HttpCode(200)
  async login(@Req() req: Request, @Body() authDto: AuthDto) {
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
    
    // --- CHANGE: Pass the req object to the service ---
    return this.authService.login(req, user, rememberMe);
  }

  @Post('logout')
@UseGuards(UniversalAuthGuard, SessionGuard) // Protected
@ApiBearerAuth('access-token')
@HttpCode(200)
@ApiOperation({ summary: 'Log out a regular user' })
async userLogout(@Req() req) {
    const sessionId = req.user.jti;
    return this.authService.userLogout(sessionId);
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
  // --- CHANGE: Added @Req() req: Request ---
 async adminLogin(@Req() req: Request, @Body() authDto: AdminUserAuthDto) {
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

    
    return this.authService.adminUserLogin(req, adminUser);
  }

@Post('admin-user/logout')
@UseGuards(AdminAuthGuard, SessionGuard) // Protected
@ApiBearerAuth('access-token')
@HttpCode(200)
@ApiOperation({ summary: 'Log out an admin user' })
async adminLogout(@Req() req) {
    const sessionId = req.user.jti;
    return this.authService.adminLogout(sessionId);
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

  @Get('app')
  async handlePasswordReset(
    @Query('token') token: string,
    @Res() res: Response,
    @Req() req: Request,
    @Headers('user-agent') userAgent: string,
  ) {
    if (!this.validateToken(token)) {
      return res.status(400).send('Invalid or expired token');
    }

    const clientIp = this.getClientIp(req);
    const platform = this.detectPlatform(userAgent || '');
    const encodedToken = encodeURIComponent(token);

    this.logRedirectAttempt(clientIp, token, platform);

    const redirectHtml = this.buildResetPasswordPage(token);
    res.setHeader('Content-Type', 'text/html');
    res.send(redirectHtml);
  }

  @Post('guest/session')
  @ApiOperation({ summary: 'Create a new guest session' })
  @HttpCode(200)
  async createGuestSession(
    @Req() req: Request,
  ) {
    const deviceInfo = req.headers['user-agent'] || 'unknown';
    const ipAddress = this.getClientIp(req);

    return this.guestUserService.createGuestSession(deviceInfo, ipAddress);
  }

  @Post('guest/upgrade')
  @ApiOperation({ summary: 'Upgrade a guest session to a full user account' })
  @ApiBody({ type: UpgradeGuestDto })
  @HttpCode(200)
  async upgradeGuestToUser(@Body() dto: UpgradeGuestDto) {
    return this.guestUserService.upgradeGuestToUser(
      new SessionID(dto.sessionId),
      new UserID(dto.userId)
    );
  }

  @Get('guest/session/:id')
  @ApiOperation({ summary: 'Get guest session details' })
  @HttpCode(200)
  async getGuestSession(@Param('id') id: string) {
    return this.guestUserService.getGuestSession(new SessionID(id));
  }

  @Get('guest/insights')
  @ApiOperation({ summary: 'Get guest user analytics' })
  @HttpCode(200)
  async getGuestInsights(
    @Query('days') days: number = 7,
    @Query('limit') limit: number = 100,
  ) {
    return this.guestUserService.getGuestInsights(days, limit);
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
      tokenHash: createHash('sha256')
        .update(token)
        .digest('hex')
        .substring(0, 8),
      platform,
      timestamp: new Date().toISOString(),
    });
  }

  private buildResetPasswordPage(token: string): string {
    const apiBaseUrl = process.env.API_BASE_URL;
    const apiEndpoint = `${apiBaseUrl}/password-reset`;
    const loginUrl = `${apiBaseUrl.replace('/auth', '')}/login`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src 'self' ${apiBaseUrl}; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;">
    <title>Reset Your Password | Hobbe EVMS</title>
    <style>
        :root {
            --primary: #4361ee;
            --primary-dark: #3a56d4;
            --error: #ef233c;
            --success: #4cc9f0;
            --text: #2b2d42;
            --light: #f8f9fa;
            --border: #dee2e6;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: var(--light);
            color: var(--text);
            line-height: 1.6;
            margin: 0;
            padding: 2rem;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        
        .reset-card {
            width: 100%;
            max-width: 420px;
            background: white;
            padding: 2.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        
        .logo {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .logo img {
            height: 80px; 
            width: auto;
            max-width: 100%;
        }
        
        h1 {
            font-size: 1.5rem;
            text-align: center;
            margin-bottom: 1.5rem;
            font-weight: 600;
        }
        
        .form-group {
            margin-bottom: 1.25rem;
        }
        
        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            font-size: 0.875rem;
        }
        
        .input-wrapper {
            position: relative;
        }
        
        input {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid var(--border);
            border-radius: 8px;
            font-size: 0.9375rem;
            transition: all 0.2s;
        }
        
        input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
        }
        
        .password-toggle {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: #adb5bd;
            font-size: 1.1rem;
        }
        
        .password-strength {
            height: 4px;
            background: var(--border);
            margin-top: 0.75rem;
            border-radius: 2px;
            overflow: hidden;
        }
        
        .strength-meter {
            height: 100%;
            width: 0%;
            transition: all 0.3s ease;
        }
        
        .requirements {
            margin-top: 0.75rem;
            font-size: 0.8125rem;
        }
        
        .requirement {
            display: flex;
            align-items: center;
            margin-bottom: 0.375rem;
            color: #6c757d;
        }
        
        .requirement i {
            margin-right: 0.5rem;
            font-size: 0.9rem;
        }
        
        .btn {
            width: 100%;
            padding: 0.875rem;
            background-color: var(--primary);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 0.5rem;
        }
        
        .btn:hover {
            background-color: var(--primary-dark);
        }
        
        .btn:disabled {
            background-color: #adb5bd;
            cursor: not-allowed;
        }
        
        .alert {
            padding: 0.875rem 1rem;
            border-radius: 8px;
            margin-top: 1.25rem;
            font-size: 0.875rem;
            display: none;
        }
        
        .alert-success {
            background-color: rgba(76, 201, 240, 0.1);
            color: var(--success);
            border: 1px solid rgba(76, 201, 240, 0.2);
        }
        
        .alert-error {
            background-color: rgba(239, 35, 60, 0.1);
            color: var(--error);
            border: 1px solid rgba(239, 35, 60, 0.2);
        }
    </style>
</head>
<body>
    <div class="reset-card">
        <div class="logo">
            <img src="/logo/image.png" alt="Hobbe EVMS Logo">
        </div>
        
        <h1>Create New Password</h1>
        
        <form id="resetForm">
            <div class="form-group">
                <label for="newPassword">New Password</label>
                <div class="input-wrapper">
                    <input type="password" id="newPassword" name="newPassword" required 
                           placeholder="Enter your new password" autocomplete="new-password">
                    <span class="password-toggle" id="toggleNewPassword">👁</span>
                </div>
                <div class="password-strength">
                    <div class="strength-meter" id="strengthMeter"></div>
                </div>
                <div class="requirements" id="passwordRequirements">
                    <div class="requirement"><span id="lengthIcon">✖</span> At least 8 characters</div>
                    <div class="requirement"><span id="uppercaseIcon">✖</span> At least 1 uppercase letter</div>
                    <div class="requirement"><span id="numberIcon">✖</span> At least 1 number</div>
                    <div class="requirement"><span id="specialIcon">✖</span> At least 1 special character</div>
                </div>
            </div>
            
            <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <div class="input-wrapper">
                    <input type="password" id="confirmPassword" name="confirmPassword" required 
                           placeholder="Confirm your new password" autocomplete="new-password">
                    <span class="password-toggle" id="toggleConfirmPassword">👁</span>
                </div>
                <div id="confirmMessage" class="requirements"></div>
            </div>
            
            <button type="submit" class="btn" id="submitBtn" disabled>Reset Password</button>
            
            <div id="message" class="alert"></div>
        </form>
    </div>

    <script>
        document.getElementById('toggleNewPassword').addEventListener('click', function() {
            togglePassword('newPassword', this);
        });
        
        document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
            togglePassword('confirmPassword', this);
        });
        
        function togglePassword(fieldId, toggleElement) {
            const input = document.getElementById(fieldId);
            if (input.type === 'password') {
                input.type = 'text';
                toggleElement.textContent = '👁️‍🗨️';
            } else {
                input.type = 'password';
                toggleElement.textContent = '👁';
            }
        }
        
        function checkPasswordStrength(password) {
            let strength = 0;
            const requirements = {
                length: password.length >= 8,
                uppercase: /[A-Z]/.test(password),
                number: /[0-9]/.test(password),
                special: /[^A-Za-z0-9]/.test(password)
            };
            
            Object.keys(requirements).forEach(key => {
                const icon = document.getElementById(key + 'Icon');
                if (requirements[key]) {
                    icon.textContent = '✓';
                    icon.style.color = '#4cc9f0';
                    strength++;
                } else {
                    icon.textContent = '✖';
                    icon.style.color = '#ef233c';
                }
            });
            
            const meter = document.getElementById('strengthMeter');
            const percent = strength * 25;
            meter.style.width = percent + '%';
            
            if (percent < 50) {
                meter.style.backgroundColor = '#ef233c';
            } else if (percent < 100) {
                meter.style.backgroundColor = '#f8961e';
            } else {
                meter.style.backgroundColor = '#4cc9f0';
            }
            
            return strength === 4;
        }
        
        function validateForm() {
            const password = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const submitBtn = document.getElementById('submitBtn');
            const confirmMessage = document.getElementById('confirmMessage');
            
            const isStrong = checkPasswordStrength(password);
            const passwordsMatch = password === confirmPassword;
            
            if (confirmPassword.length > 0) {
                confirmMessage.innerHTML = passwordsMatch 
                    ? '<span style="color:#4cc9f0">✓ Passwords match</span>' 
                    : '<span style="color:#ef233c">✖ Passwords do not match</span>';
            } else {
                confirmMessage.textContent = '';
            }
            
            submitBtn.disabled = !(isStrong && passwordsMatch);
        }
        
        async function handleSubmit(e) {
            e.preventDefault();
            
            const password = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const submitBtn = document.getElementById('submitBtn');
            const messageDiv = document.getElementById('message');
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
            messageDiv.style.display = 'none';
            
            try {
                const response = await fetch('${apiEndpoint}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        newPassword: password,
                        token: '${token}',
                        confirmPassword: confirmPassword
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to reset password');
                }
                
                messageDiv.className = 'alert alert-success';
                messageDiv.textContent = data.message || 'Password reset successfully!';
                messageDiv.style.display = 'block';
                
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
                
                
            } catch (error) {
                messageDiv.className = 'alert alert-error';
                messageDiv.textContent = error.message || 'An error occurred while resetting your password';
                messageDiv.style.display = 'block';
                console.error('Error:', error);
            } finally {
                submitBtn.textContent = 'Reset Password';
                submitBtn.disabled = false;
            }
        }
        
        // Initialize event listeners
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('newPassword').addEventListener('input', validateForm);
            document.getElementById('confirmPassword').addEventListener('input', validateForm);
            document.getElementById('resetForm').addEventListener('submit', handleSubmit);
            
            validateForm();
        });
    </script>
</body>
</html>
    `;
  }
}
