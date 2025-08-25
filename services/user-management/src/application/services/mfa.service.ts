import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/domain/entities/user.entity';
import { UserSecuritySetting } from 'src/domain/entities/user-security-setting.entity';
import { Repository } from 'typeorm';
import * as otplib from 'otplib';
import * as qrcode from 'qrcode';
import { AdminUser } from 'src/domain/entities/admin-user.entity';

@Injectable()
export class MfaService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AdminUser)
    private readonly adminUserRepository: Repository<AdminUser>,
    @InjectRepository(UserSecuritySetting)
    private readonly userSecuritySettingRepository: Repository<UserSecuritySetting>,
  ) {}

  /**
   * Generates a new MFA secret and a QR code for the user to scan.
   * This is the first step of the enrollment process.
   */
  async generateMfaSetup(userId: string, email: string, isAdmin: boolean) {
    // 1. Get or create the user's security settings record.
    let securitySettings = await this.userSecuritySettingRepository.findOneBy({ user_id: userId });
    if (!securitySettings) {
      securitySettings = this.userSecuritySettingRepository.create({ user_id: userId });
    }

    // 2. If MFA is already fully enabled, prevent generating a new key.
    if (securitySettings.mfa_enabled) {
      throw new HttpException('MFA is already enabled for this account.', HttpStatus.BAD_REQUEST);
    }

    // 3. Generate a new secret using otplib.
    const secret = otplib.authenticator.generateSecret();

    // 4. Create the standard URI for authenticator apps.
    const appName = 'Hobbe EVMS';
    const otpauthUrl = otplib.authenticator.keyuri(email, appName, secret);

    // 5. Save the secret temporarily. It is not yet verified.
    securitySettings.mfa_temp_secret = secret;
    await this.userSecuritySettingRepository.save(securitySettings);

    // 6. Generate a QR code image from the URI and return it as a data URL.
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
    
    return {
      message: 'Scan the QR code with your authenticator app and verify the token to enable MFA.',
      qrCodeDataUrl,
    };
  }

  /**
   * Verifies the TOTP code provided by the user and fully enables MFA.
   * This is the final step of the enrollment process.
   */
  async verifyAndEnableMfa(userId: string, token: string) {
    const securitySettings = await this.userSecuritySettingRepository.findOneBy({ user_id: userId });

    // 1. Check if there is a temporary secret to verify.
    if (!securitySettings || !securitySettings.mfa_temp_secret) {
      throw new HttpException('MFA setup has not been initiated. Please generate a QR code first.', HttpStatus.BAD_REQUEST);
    }

    // 2. Verify the provided token against the temporary secret.
    const isTokenValid = otplib.authenticator.check(
      token,
      securitySettings.mfa_temp_secret,
    );

    if (!isTokenValid) {
      throw new HttpException('Invalid authentication code.', HttpStatus.UNAUTHORIZED);
    }

    // 3. On successful verification, move the secret to the permanent field.
    securitySettings.mfa_secret = securitySettings.mfa_temp_secret;
    securitySettings.mfa_temp_secret = null; // Clear the temporary secret
    securitySettings.mfa_enabled = true;
    securitySettings.last_mfa_verified_at = new Date();

    await this.userSecuritySettingRepository.save(securitySettings);

    return { message: 'MFA has been successfully enabled on your account.' };
  }
}