import { Body, Controller, HttpCode, Post, Req, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MfaService } from 'src/application/services/mfa.service';
import { InitiateMfaDto } from '../dtos/initiate-mfa.dto';
import { Public } from '../decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/domain/entities/user.entity';
import { AdminUser } from 'src/domain/entities/admin-user.entity';
import { Repository } from 'typeorm';
import { VerifyMfaSetupDto } from '../dtos/verify-mfa-setup.dto';
import { AuthService } from 'src/application/services/auth.service';
import { Request } from 'express';

@ApiTags('MFA')
@Controller('mfa')
export class MfaController {
  constructor(
    private readonly mfaService: MfaService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AdminUser)
    private readonly adminUserRepository: Repository<AdminUser>,
    // AuthService is required to issue the final login tokens
    private readonly authService: AuthService,
  ) {}

  /**
   * Step 1 of the forced MFA setup flow.
   * This endpoint is called when a user logs in and is required to set up MFA.
   * It uses the short-lived 'setupToken' to generate a QR code.
   */
  @Post('initiate-setup')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Step 1 (Login Flow): Generate QR code using a setupToken' })
  @ApiResponse({ status: 200, description: 'QR code generated successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired setup token.' })
  async initiateMfaSetup(@Body() initiateMfaDto: InitiateMfaDto) {
    try {
      const payload = this.jwtService.verify(initiateMfaDto.setupToken, { secret: process.env.JWT_SECRET });
      if (payload.purpose !== 'mfa-setup') {
        throw new UnauthorizedException('Invalid token purpose.');
      }

      const { sub: userId, isAdmin } = payload;
      let email: string;

      if (isAdmin) {
        const admin = await this.adminUserRepository.findOneBy({ admin_user_id: userId });
        if (!admin) throw new UnauthorizedException('Admin user not found.');
        email = admin.user_name;
      } else {
        const user = await this.userRepository.findOneBy({ user_id: userId });
        if (!user) throw new UnauthorizedException('User not found.');
        email = user.user_name;
      }

      return this.mfaService.generateMfaSetup(userId, email, isAdmin);

    } catch (error) {
      throw new UnauthorizedException('Invalid or expired MFA setup token.');
    }
  }

  /**
   * Step 2 of the forced MFA setup flow.
   * Verifies the 6-digit code from the authenticator app and, if successful,
   * completes the login process by issuing the final access and refresh tokens.
   */
  @Post('verify-setup')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Step 2 (Login Flow): Verify code and get final login tokens' })
  @ApiResponse({ status: 200, description: 'MFA setup successful, final tokens returned.' })
  @ApiResponse({ status: 401, description: 'Invalid MFA code or setup token.' })
  async verifyMfaSetup(@Req() req: Request, @Body() verifyDto: VerifyMfaSetupDto) {
    try {
      const payload = this.jwtService.verify(verifyDto.setupToken, { secret: process.env.JWT_SECRET });
      if (payload.purpose !== 'mfa-setup') {
        throw new UnauthorizedException('Invalid token purpose.');
      }

      const { sub: userId, isAdmin } = payload;
      
      // This verifies the 6-digit code and saves the secret permanently in the database.
      await this.mfaService.verifyAndFinalizeSetup(userId, verifyDto.mfaCode, isAdmin);

      // If verification was successful, we immediately issue the final login tokens.
      if (isAdmin) {
        const adminUser = await this.adminUserRepository.findOneBy({ admin_user_id: userId });
        if (!adminUser) throw new UnauthorizedException('Admin user not found.');
        return this.authService.issueAdminTokens(req, adminUser);
      } else {
        const user = await this.userRepository.findOneBy({ user_id: userId });
        if (!user) throw new UnauthorizedException('User not found.');
        return this.authService.issueUserTokens(req, user, false); // rememberMe is false for this flow
      }

    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired MFA setup session.');
    }
  }
}