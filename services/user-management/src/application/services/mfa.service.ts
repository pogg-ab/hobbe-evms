import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSecuritySetting } from 'src/domain/entities/user-security-setting.entity';
import { Repository } from 'typeorm';
import * as otplib from 'otplib';
import * as qrcode from 'qrcode';
import { AdminUserSecuritySetting } from 'src/domain/entities/admin-user-security-setting.entity';

@Injectable()
export class MfaService {
  constructor(
    @InjectRepository(UserSecuritySetting)
    private readonly userSecuritySettingRepository: Repository<UserSecuritySetting>,
    @InjectRepository(AdminUserSecuritySetting)
    private readonly adminSecuritySettingRepository: Repository<AdminUserSecuritySetting>,
  ) {}

  /**
   * Generates a temporary MFA secret and a QR code for a user or admin during the setup flow.
   * This is called by the /mfa/initiate-setup endpoint.
   */
  async generateMfaSetup(userId: string, email: string, isAdmin: boolean) {
    if (isAdmin) {
      let settings = await this.adminSecuritySettingRepository.findOneBy({ admin_user_id: userId });
      if (!settings) {
        settings = this.adminSecuritySettingRepository.create({ admin_user_id: userId });
      }
      // Security check: if MFA is already fully configured, throw an error.
      // An admin would need to reset it first.
      if (settings.mfa_secret) {
        throw new HttpException('MFA is already configured for this admin account. Please contact support for a reset.', HttpStatus.BAD_REQUEST);
      }
      const secret = otplib.authenticator.generateSecret();
      const appName = 'Hobbe EVMS (Admin)';
      const otpauthUrl = otplib.authenticator.keyuri(email, appName, secret);
      
      settings.mfa_temp_secret = secret; // Store the secret temporarily
      await this.adminSecuritySettingRepository.save(settings);
      
      const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
      return {
        message: 'Scan the QR code with your authenticator app and verify the token to enable MFA.',
        qrCodeDataUrl,
      };
    } else {
      // Logic for regular users
      let settings = await this.userSecuritySettingRepository.findOneBy({ user_id: userId });
      if (!settings) {
        settings = this.userSecuritySettingRepository.create({ user_id: userId });
      }
      if (settings.mfa_secret) {
        throw new HttpException('MFA is already configured for this account. Please contact support for a reset.', HttpStatus.BAD_REQUEST);
      }
      const secret = otplib.authenticator.generateSecret();
      const appName = 'Hobbe EVMS';
      const otpauthUrl = otplib.authenticator.keyuri(email, appName, secret);
      
      settings.mfa_temp_secret = secret;
      await this.userSecuritySettingRepository.save(settings);
      
      const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
      return {
        message: 'Scan the QR code with your authenticator app and verify the token to enable MFA.',
        qrCodeDataUrl,
      };
    }
  }

  /**
   * Verifies the TOTP code against the temporary secret and finalizes the MFA setup.
   * This is called by the /mfa/verify-setup endpoint.
   */
  async verifyAndFinalizeSetup(userId: string, token: string, isAdmin: boolean): Promise<{ success: boolean }> {
    if (isAdmin) {
      const settings = await this.adminSecuritySettingRepository.findOneBy({ admin_user_id: userId });
      if (!settings || !settings.mfa_temp_secret) {
        throw new HttpException('Admin MFA setup has not been initiated.', HttpStatus.BAD_REQUEST);
      }
      
      const isTokenValid = otplib.authenticator.check(token, settings.mfa_temp_secret);
      if (!isTokenValid) {
        throw new HttpException('Invalid authentication code.', HttpStatus.UNAUTHORIZED);
      }
      
      // Finalize setup: move the temp secret to the permanent secret and enable MFA.
      settings.mfa_secret = settings.mfa_temp_secret;
      settings.mfa_temp_secret = null;
      settings.mfa_enabled = true;
      settings.last_mfa_verified_at = new Date();
      await this.adminSecuritySettingRepository.save(settings);
      
      return { success: true };
    } else {
      // Logic for regular users
      const settings = await this.userSecuritySettingRepository.findOneBy({ user_id: userId });
      if (!settings || !settings.mfa_temp_secret) {
        throw new HttpException('MFA setup has not been initiated.', HttpStatus.BAD_REQUEST);
      }
      
      const isTokenValid = otplib.authenticator.check(token, settings.mfa_temp_secret);
      if (!isTokenValid) {
        throw new HttpException('Invalid authentication code.', HttpStatus.UNAUTHORIZED);
      }
      
      settings.mfa_secret = settings.mfa_temp_secret;
      settings.mfa_temp_secret = null;
      settings.mfa_enabled = true;
      settings.last_mfa_verified_at = new Date();
      await this.userSecuritySettingRepository.save(settings);
      
      return { success: true };
    }
  }

  
}