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
    // --- NEW REPOSITORY INJECTION ---
    @InjectRepository(AdminUserSecuritySetting)
    private readonly adminSecuritySettingRepository: Repository<AdminUserSecuritySetting>,
  ) {}

  /**
   * Generates a new MFA secret and a QR code for either a user or an admin.
   */
  async generateMfaSetup(userId: string, email: string, isAdmin: boolean) {
    if (isAdmin) {
      // --- ADMIN-SPECIFIC LOGIC ---
      let settings = await this.adminSecuritySettingRepository.findOneBy({ admin_user_id: userId });
      if (!settings) {
        settings = this.adminSecuritySettingRepository.create({ admin_user_id: userId });
      }
      if (settings.mfa_enabled) {
        throw new HttpException('MFA is already enabled for this admin account.', HttpStatus.BAD_REQUEST);
      }
      const secret = otplib.authenticator.generateSecret();
      const appName = 'Hobbe EVMS (Admin)'; // Differentiate the app name
      const otpauthUrl = otplib.authenticator.keyuri(email, appName, secret);
      settings.mfa_temp_secret = secret;
      await this.adminSecuritySettingRepository.save(settings);
      const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
      return {
        message: 'Scan the QR code with your authenticator app and verify the token to enable MFA.',
        qrCodeDataUrl,
      };
    } else {
      // --- REGULAR USER LOGIC (Your existing, correct logic) ---
      let settings = await this.userSecuritySettingRepository.findOneBy({ user_id: userId });
      if (!settings) {
        settings = this.userSecuritySettingRepository.create({ user_id: userId });
      }
      if (settings.mfa_enabled) {
        throw new HttpException('MFA is already enabled for this account.', HttpStatus.BAD_REQUEST);
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
   * Verifies the TOTP code and fully enables MFA for either a user or an admin.
   */
  async verifyAndEnableMfa(userId: string, token: string, isAdmin: boolean) {
    if (isAdmin) {
      // --- ADMIN-SPECIFIC LOGIC ---
      const settings = await this.adminSecuritySettingRepository.findOneBy({ admin_user_id: userId });
      if (!settings || !settings.mfa_temp_secret) {
        throw new HttpException('Admin MFA setup has not been initiated.', HttpStatus.BAD_REQUEST);
      }
      const isTokenValid = otplib.authenticator.check(token, settings.mfa_temp_secret);
      if (!isTokenValid) {
        throw new HttpException('Invalid authentication code.', HttpStatus.UNAUTHORIZED);
      }
      settings.mfa_secret = settings.mfa_temp_secret;
      settings.mfa_temp_secret = null;
      settings.mfa_enabled = true;
      settings.last_mfa_verified_at = new Date();
      await this.adminSecuritySettingRepository.save(settings);
      return { message: 'MFA has been successfully enabled on your admin account.' };
    } else {
      // --- REGULAR USER LOGIC (Your existing, correct logic) ---
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
      return { message: 'MFA has been successfully enabled on your account.' };
    }
  }
}