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

    const redirectHtml = this.buildResetPasswordPage(token);
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

  private buildResetPasswordPage(token: string): string {
    const apiBaseUrl = process.env.API_BASE_URL || 'http://89.117.37.84:4000/auth';
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
            height: 42px;
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
            <img src="https://via.placeholder.com/150x50?text=Hobbe+EVMS" alt="Hobbe EVMS Logo">
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
                
                setTimeout(() => {
                    window.location.href = '${loginUrl}';
                }, 3000);
                
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

