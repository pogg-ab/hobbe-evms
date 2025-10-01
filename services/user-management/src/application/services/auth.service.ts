import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AdminUserAuth } from 'src/domain/entities/admin-user-auth.entity';
import { AdminUserRole } from 'src/domain/entities/admin-user-role.entity';
import { AdminUser } from 'src/domain/entities/admin-user.entity';
import { Auth } from 'src/domain/entities/auth.entity';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { UserRole } from 'src/domain/entities/user-role.entity';
import { User } from 'src/domain/entities/user.entity';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { AccessToken } from 'src/domain/value-objects/access-token.value-object';
import { RefreshToken } from 'src/domain/value-objects/refresh-token.value-object';
import { MessageProducerService } from 'src/infrastructure/kafka/message.producer.service';
import { NotificationConfigService } from 'src/infrastructure/notification-config.service';
import { MessageType } from 'src/presentation/dtos/create-sms.dto';
import { Repository } from 'typeorm';
import { AuditLogService } from './audit-log.service';
import { AdminUserSecuritySetting } from 'src/domain/entities/admin-user-security-setting.entity';
import { UserSecuritySetting } from 'src/domain/entities/user-security-setting.entity';
import { UserSession } from 'src/domain/entities/user-session.entity';
import { AdminUserSession } from 'src/domain/entities/admin-user-session.entity';
import { SystemSetting } from 'src/domain/entities/system-setting.entity';
import * as otplib from 'otplib';
import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

@Injectable()
export class AuthService {
  constructor(
    private readonly auditLogService: AuditLogService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PersonalAccount)
    private readonly personalAccountRepository: Repository<PersonalAccount>,
    @InjectRepository(OrganizationalAccount)
    private readonly organizationalAccountRepository: Repository<OrganizationalAccount>,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private jwtService: JwtService,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(AdminUser)
    private readonly adminUserRepository: Repository<AdminUser>,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    @InjectRepository(AdminUserSession)
    private readonly adminSessionRepository: Repository<AdminUserSession>,
    @InjectRepository(AdminUserAuth)
    private readonly adminUserAuthRepository: Repository<AdminUserAuth>,
    @InjectRepository(AdminUserRole)
    private readonly adminUserRoleRepository: Repository<AdminUserRole>,
    @InjectRepository(SystemSetting)
    private readonly systemSettingRepository: Repository<SystemSetting>,

    @InjectRepository(UserSecuritySetting)
    private readonly userSecuritySettingRepository: Repository<UserSecuritySetting>,
    @InjectRepository(AdminUserSecuritySetting)
    private readonly adminSecuritySettingRepository: Repository<AdminUserSecuritySetting>,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userWithAccountRepository: IUserRepository,
    private readonly messageProducerService: MessageProducerService,
    private readonly notificationConfigService: NotificationConfigService,
  ) {}

  async validateUser(user_name: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { user_name } });
    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        if (!user.is_active) {
          await this.auditLogService.logAction({
            user_id: user.user_id.toString(),
            action: 'USER_LOGIN_FAILURE',
            module: 'AuthService',
            serviceName: 'user-management',
            details: { reason: 'Inactive account' },
          });

          return {
            statusCode: HttpStatus.FORBIDDEN,
            success: false,
            message:
              'Your account is not verified or is inactive. Please verify your email or contact support.',
          };
        }
        return {
          statusCode: HttpStatus.OK,
          success: true,
          message: 'User validated successfully.',
          user: user,
        };
      } else {
        await this.auditLogService.logAction({
          user_id: user.user_id.toString(),
          action: 'USER_LOGIN_FAILURE',
          module: 'AuthService',
          serviceName: 'user-management',
          details: { reason: 'Invalid password' },
        });
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          success: false,
          message:
            'Invalid credentials. Please check your username and password.',
        };
      }
    }
    await this.auditLogService.logAction({
      action: 'USER_LOGIN_FAILURE',
      module: 'AuthService',
      serviceName: 'user-management',
      details: { reason: 'User not found', attemptedUsername: user_name },
    });
    return {
      statusCode: HttpStatus.NOT_FOUND,
      success: false,
      message: 'User not found. Please check your username.',
    };
  }

  async validateAdminUser(user_name: string, password: string): Promise<any> {
    const user = await this.adminUserRepository.findOne({
      where: { user_name },
    });
    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        if (!user.is_active) {
          await this.auditLogService.logAction({
            user_id: user.admin_user_id.toString(),
            action: 'ADMIN_LOGIN_FAILURE',
            module: 'AuthService',
            serviceName: 'user-management',
            details: { reason: 'Inactive account' },
          });
          return {
            statusCode: HttpStatus.FORBIDDEN,
            success: false,
            message: 'Your account is inactive. Please contact support.',
          };
        }
        return {
          statusCode: HttpStatus.OK,
          success: true,
          message: 'User validated successfully.',
          user: user,
        };
      } else {
        await this.auditLogService.logAction({
          user_id: user.admin_user_id.toString(),
          action: 'ADMIN_LOGIN_FAILURE',
          module: 'AuthService',
          serviceName: 'user-management',
          details: { reason: 'Invalid password' },
        });
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          success: false,
          message:
            'Invalid credentials. Please check your username and password.',
        };
      }
    }
    await this.auditLogService.logAction({
      action: 'ADMIN_LOGIN_FAILURE',
      module: 'AuthService',
      serviceName: 'user-management',
      details: { reason: 'User not found', attemptedUsername: user_name },
    });
    return {
      statusCode: HttpStatus.NOT_FOUND,
      success: false,
      message: 'User not found. Please check your username.',
    };
  }

  async login(req: Request, user: any, rememberMe: boolean) {
    const validatedUser: User = user.user;
    const mfaRequiredSetting = await this.systemSettingRepository.findOne({
      where: { key: 'MFA_REQUIRED' },
    });
    const isMfaRequiredBySystem = mfaRequiredSetting?.value === 'true';
    const userSecurity = await this.userSecuritySettingRepository.findOne({
      where: { user_id: validatedUser.user_id.toString() },
    });

    if (isMfaRequiredBySystem) {
      if (userSecurity?.mfa_secret) {
        const payload = {
          sub: validatedUser.user_id.toString(),
          purpose: 'mfa-verification',
          isAdmin: false,
        };
        const interimToken = this.jwtService.sign(payload, { expiresIn: '5m' });
        return { mfaRequired: true, interimToken: interimToken };
      } else {
        const payload = {
          sub: validatedUser.user_id.toString(),
          purpose: 'mfa-setup',
          isAdmin: false,
        };
        const setupToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        return { mfaSetupRequired: true, setupToken: setupToken };
      }
    } else {
      return this.issueUserTokens(req, validatedUser, rememberMe);
    }
  }

  async requestPasswordReset(user_name: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { user_name } });
    if (!user) {
      await this.auditLogService.logAction({
        action: 'PASSWORD_RESET_REQUEST_FAILURE',
        module: 'AuthService',
        serviceName: 'user-management',
        details: { reason: 'User not found', attemptedUsername: user_name },
      });
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (!user.is_active) {
      await this.auditLogService.logAction({
        user_id: user.user_id.toString(),
        action: 'PASSWORD_RESET_REQUEST_FAILURE',
        module: 'AuthService',
        serviceName: 'user-management',
        details: { reason: 'Inactive account' },
      });
      throw new HttpException(
        'Your account is not active. Please contact support.',
        HttpStatus.FORBIDDEN,
      );
    }

    const now = new Date();
    const rateLimitWindow = 5 * 60 * 1000;

    if (user.password_reset_requested_at) {
      const timeSinceLastRequest =
        now.getTime() - new Date(user.password_reset_requested_at).getTime();
      if (timeSinceLastRequest < rateLimitWindow) {
        throw new HttpException(
          'You can only request a password reset every 5 minutes.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    const resetToken = this.generatePasswordResetToken();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

    user.password_reset_requested_at = now;
    user.password_reset_token = resetToken;
    user.password_reset_token_expiry = resetTokenExpiry;

    await this.userRepository.save(user);

    await this.auditLogService.logAction({
      user_id: user.user_id.toString(),
      action: 'PASSWORD_RESET_REQUEST_SUCCESS',
      module: 'AuthService',
    });

    const emailPayload = this.createPasswordResetEmail(
      user.user_name,
      resetToken,
    );

    try {
      await this.messageProducerService.sendEmailToKafka(emailPayload);
      return {
        success: true,
        message: 'Password reset token sent to your email.',
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        message: 'Failed to send password reset email.',
      };
    }
  }

  async verifyPasswordResetToken(token: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { password_reset_token: token },
    });
    if (!user) {
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.BAD_REQUEST,
      );
    }

    const now = new Date();
    if (now > user.password_reset_token_expiry) {
      throw new HttpException('Token has expired', HttpStatus.BAD_REQUEST);
    }

    return { message: 'Token verified successfully.' };
  }

  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<any> {
    if (newPassword !== confirmPassword) {
      throw new HttpException(
        'Password and confirm password do not match',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.userRepository.findOne({
      where: { password_reset_token: token },
    });
    if (!user) {
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.BAD_REQUEST,
      );
    }

    const now = new Date();
    if (now > user.password_reset_token_expiry) {
      throw new HttpException('Token has expired', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;

    user.password_reset_token = null;
    user.password_reset_token_expiry = null;

    await this.userRepository.save(user);

    return { message: 'Password has been successfully reset.' };
  }

  private generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  private createPasswordResetEmail(recipient: string, token: string): any {
    const resetLink = `${process.env.WEB_RESET_LINK}?token=${encodeURIComponent(token)}`;
    const appDeepLink = `${process.env.APP_DEEP_LINK}?token=${encodeURIComponent(token)}`;
    const fallbackLink = resetLink;
    const redirectLink = `${process.env.API_BASE_URL}/app?token=${encodeURIComponent(token)}`;
    const email = {
      recipient: recipient,
      subject: 'Password Reset Request',
      body: `
        <html>
          <body>
            <p>Dear ${recipient},</p>
            <p>We have received a request to reset your password for your Hobbe EVMS account. If you did not make this request, please ignore this email.</p>
            <p>To reset your password, please click the button below:</p>
            <div style="margin: 20px 0;">
              <a href="${redirectLink}" 
                 style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                Reset Your Password in App
              </a>
              <p>If the app doesn't open, <a href="${redirectLink}">try again</a> (it will fall back to web).</p>
            </div>

            
            <p>The reset link will expire at <strong>${new Date(new Date().getTime() + 60 * 60 * 1000).toUTCString()}</strong>. If you do not reset your password by this time, the link will no longer be valid.</p>
            <p>If you have any trouble, feel free to contact our support team for assistance.</p>
            <br>
            <p>Best regards,</p>
            <p><strong>Hobbe EVMS Team</strong></p>
          </body>
        </html>
      `,
      created_at: new Date(),
      updated_at: new Date(),
      sent_at: null,
    };

    return email;
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      const auth = await this.authRepository.findOne({
        where: { refresh_token: refreshToken },
      });

      if (!auth) {
        throw new HttpException(
          'Invalid refresh token',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const now = new Date();
      if (now > auth.token_expires_at) {
        const newRefreshToken = this.generateRefreshToken();
        const newExpiryDate = new Date(now.getTime() + 30 * 86400000);

        auth.refresh_token = newRefreshToken;
        auth.token_expires_at = newExpiryDate;

        const payload = { username: decoded.username, sub: decoded.sub };
        const newAccessToken = new AccessToken(
          this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '1d', // Access token expiry: 1 day
          }),
        );

        auth.access_token = newAccessToken.toString();

        return {
          message: 'Tokens updated successfully.',
          access_token: newAccessToken.toString(),
          refresh_token: newRefreshToken,
        };
      }
      const payload = { username: decoded.username, sub: decoded.sub };

      const newAccessToken = new AccessToken(
        this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
          expiresIn: '1d',
        }),
      );
      auth.access_token = newAccessToken.toString();
      await this.authRepository.save(auth);
      return {
        message: 'Access token refreshed successfully.',
        access_token: newAccessToken.toString(),
        refresh_token: refreshToken,
      };
    } catch (error) {
      throw new HttpException(
        'Invalid or expired refresh token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async decodeAndValidateToken(token: string): Promise<string> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      return decoded.sub;
    } catch (error) {
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async getUserAccountInfo(userId: string): Promise<any> {
    const userAccountInfo =
      await this.userWithAccountRepository.findById(userId);

    if (!userAccountInfo) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return userAccountInfo;
  }

  async adminUserLogin(req: Request, user: any) {
    const adminUser: AdminUser = user.user;
    const mfaRequiredSetting = await this.systemSettingRepository.findOne({
      where: { key: 'MFA_REQUIRED' },
    });
    const isMfaRequiredBySystem = mfaRequiredSetting?.value === 'true';
    const securitySettings = await this.adminSecuritySettingRepository.findOne({
      where: { admin_user_id: adminUser.admin_user_id.toString() },
    });

    if (isMfaRequiredBySystem) {
      if (securitySettings?.mfa_secret) {
        const payload = {
          sub: adminUser.admin_user_id.toString(),
          purpose: 'mfa-verification',
          isAdmin: true,
        };
        const interimToken = this.jwtService.sign(payload, { expiresIn: '5m' });
        return { mfaRequired: true, interimToken: interimToken };
      } else {
        const payload = {
          sub: adminUser.admin_user_id.toString(),
          purpose: 'mfa-setup',
          isAdmin: true,
        };
        const setupToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        return { mfaSetupRequired: true, setupToken: setupToken };
      }
    } else {
      return this.issueAdminTokens(req, adminUser);
    }
  }

  private async getAdminPermissions(adminUserId: string): Promise<string[]> {
    const userRoles = await this.adminUserRoleRepository.find({
      where: {
        admin_user_id: adminUserId as any,
      },
      relations: {
        role: {
          rolePermissions: {
            permission: true,
          },
        },
      },
    });

    const permissions = userRoles.flatMap((userRole) =>
      (userRole.role.rolePermissions || []).map(
        (link) => `${link.permission.action}:${link.permission.resource}`,
      ),
    );

    return [...new Set(permissions)];
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  async verifyOTP(user_name: string, otp: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { user_name },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (user.otp === otp && new Date() < new Date(user.otp_expiry)) {
        user.is_active = true;
        user.otp = null;
        user.otp_expiry = null;
        await this.userRepository.save(user);

        return { message: 'User account activated successfully.' };
      } else {
        throw new HttpException(
          'Invalid OTP or OTP expired',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException(
        `Error verifying OTP: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  private async getPhoneNumberByAccount(user: User): Promise<string> {
    let phoneNumberToUse: string;

    const organizationalAccount =
      await this.organizationalAccountRepository.findOne({
        where: { organizational_account_id: user.organizational_account },
      });

    const personalAccount = await this.personalAccountRepository.findOne({
      where: { personal_account_id: user.personal_account },
    });

    if (organizationalAccount) {
      phoneNumberToUse = organizationalAccount.company_phone_number || '';
    } else if (personalAccount) {
      phoneNumberToUse = personalAccount.phone_number || '';
    } else {
      throw new Error('No valid account found for this user.');
    }

    return phoneNumberToUse;
  }

  async resendOTP(user_name: string) {
    try {
      const user = await this.userRepository.findOne({ where: { user_name } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const otp = this.generateOtp();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

      user.otp = otp;
      user.otp_expiry = otpExpiry;
      await this.userRepository.save(user);
      if (this.notificationConfigService.useSmsNotification) {
        const smsMessage = `Your OTP for Hobbe EVMS registration is ${otp}. Please enter this code to complete your registration. The code will expire in 10 minutes.`;
        const phoneNumber = await this.getPhoneNumberByAccount(user);

        const smsPayload = {
          recipient: phoneNumber,
          message: smsMessage,
          messageType: MessageType.OTP,
        };

        await this.messageProducerService.sendSmsToKafka(smsPayload);
      } else {
        const email = this.createOtpEmail(user.user_name, otp);

        await this.messageProducerService.sendEmailToKafka(email);
      }

      return { message: 'OTP resent successfully.' };
    } catch (error) {
      throw new HttpException(
        `Error resending OTP: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  private createOtpEmail(recipient: string, otp: string): any {
    const email = {
      recipient: recipient,
      subject: 'Your OTP Code from Hobbe EVMS',
      body: otp,
      created_at: new Date(),
      updated_at: new Date(),
      sent_at: null,
    };

    return email;
  }

  async validateJwt(payload: any) {
    const user = await this.userRepository.findOne({
      where: { user_id: payload.sub },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const userRoles = await this.userRoleRepository.find({
      where: { user_id: payload.sub },
      relations: ['role'],
    });

    const roles = userRoles.map((userRole) => userRole.role.name);
    return { success: true, user, roles };
  }

  async validateAdminUserJwt(payload: any) {
    const user = await this.adminUserRepository.findOne({
      where: { admin_user_id: payload.sub },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const userRoles = await this.adminUserRoleRepository.find({
      where: { admin_user_id: payload.sub },
      relations: ['role'],
    });

    const roles = userRoles.map((userRole) => userRole.role.name);
    return { success: true, user, roles };
  }
  async verifyMfaAndLogin(req: Request, interimToken: string, mfaCode: string) {
    try {
      const payload = this.jwtService.verify(interimToken, {
        secret: process.env.JWT_SECRET,
      });

      if (payload.purpose !== 'mfa-verification') {
        throw new Error('Invalid token purpose');
      }

      const userId = payload.sub;
      let isMfaCodeValid = false;

      if (payload.isAdmin) {
        const securitySettings =
          await this.adminSecuritySettingRepository.findOneBy({
            admin_user_id: userId,
          });
        if (
          !securitySettings ||
          !securitySettings.mfa_enabled ||
          !securitySettings.mfa_secret
        ) {
          throw new HttpException(
            'MFA is not configured for this admin.',
            HttpStatus.BAD_REQUEST,
          );
        }
        isMfaCodeValid = otplib.authenticator.check(
          mfaCode,
          securitySettings.mfa_secret,
        );
      } else {
        const securitySettings =
          await this.userSecuritySettingRepository.findOneBy({
            user_id: userId,
          });
        if (
          !securitySettings ||
          !securitySettings.mfa_enabled ||
          !securitySettings.mfa_secret
        ) {
          throw new HttpException(
            'MFA is not configured for this user.',
            HttpStatus.BAD_REQUEST,
          );
        }
        isMfaCodeValid = otplib.authenticator.check(
          mfaCode,
          securitySettings.mfa_secret,
        );
      }

      if (!isMfaCodeValid) {
        await this.auditLogService.logAction({
          user_id: userId,
          action: payload.isAdmin ? 'ADMIN_MFA_FAILURE' : 'USER_MFA_FAILURE',
          module: 'AuthService',
          serviceName: 'user-management',
          details: { reason: 'Invalid MFA code' },
        });
        throw new HttpException('Invalid MFA code.', HttpStatus.UNAUTHORIZED);
      }

      if (payload.isAdmin) {
        const adminUser = await this.adminUserRepository.findOneBy({
          admin_user_id: userId,
        });
        if (!adminUser)
          throw new HttpException('Admin user not found', HttpStatus.NOT_FOUND);
        return this.issueAdminTokens(req, adminUser);
      } else {
        const user = await this.userRepository.findOneBy({ user_id: userId });
        if (!user)
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        return this.issueUserTokens(req, user, false);
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Invalid or expired MFA session token.',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  public async issueUserTokens(req: Request, user: User, rememberMe: boolean) {
    const session = this.userSessionRepository.create({
      user_id: user.user_id.toString(),
      last_activity: new Date(),
      ip_address: req.ip,
      user_agent: req.headers['user-agent'] || '',
    });
    const savedSession = await this.userSessionRepository.save(session);

    const payload = {
      username: user.user_name,
      sub: user.user_id,
      jti: savedSession.session_id,
    };

    const access_token = new AccessToken(
      this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1d',
      }),
    );

    let refresh_token: string | null = null;
    if (rememberMe) {
      refresh_token = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '30d',
      });
    }

    const token_expires_at = rememberMe
      ? new Date(new Date().getTime() + 30 * 86400000)
      : new Date(new Date().getTime() + 86400000);

    let auth = await this.authRepository.findOne({
      where: { user_id: user.user_id },
    });
    if (auth) {
      auth.access_token = access_token.toString();
      auth.refresh_token = refresh_token ? refresh_token.toString() : '';
      auth.token_expires_at = token_expires_at;
      auth.last_login = new Date();
      await this.authRepository.save(auth);
    } else {
      auth = new Auth();
      auth.user_id = user.user_id;
      auth.access_token = access_token.toString();
      auth.refresh_token = refresh_token ? refresh_token.toString() : '';
      auth.token_expires_at = token_expires_at;
      auth.last_login = new Date();
      await this.authRepository.save(auth);
    }

    return {
      access_token: access_token.toString(),
      ...(refresh_token && { refresh_token: refresh_token.toString() }),
    };
  }

  public async issueAdminTokens(req: Request, adminUser: AdminUser) {
    const adminIdString = adminUser.admin_user_id.toString();
    const session = this.adminSessionRepository.create({
      admin_user_id: adminUser.admin_user_id.toString(),
      last_activity: new Date(),
      ip_address: req.ip,
      user_agent: req.headers['user-agent'] || '',
    });
    const savedSession = await this.adminSessionRepository.save(session);
    const permissions = await this.getAdminPermissions(adminIdString);
    const payload = {
      username: adminUser.user_name,
      sub: adminIdString,
      jti: savedSession.session_id,
      permissions: permissions,
      isAdmin: true,
    };

    const access_token = new AccessToken(
      this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1d',
      }),
    );
    const refresh_token = new RefreshToken(this.generateRefreshToken());
    const token_expires_at = new Date(Date.now() + 86400000);

    let auth = await this.adminUserAuthRepository.findOne({
      where: { admin_user_id: adminUser.admin_user_id },
    });
    if (!auth) {
      auth = new AdminUserAuth();
      auth.admin_user_id = adminUser.admin_user_id;
    }
    auth.access_token = access_token.toString();
    auth.refresh_token = refresh_token.toString();
    auth.token_expires_at = token_expires_at;
    auth.last_login = new Date();
    await this.adminUserAuthRepository.save(auth);

    return {
      access_token: access_token.toString(),
      refresh_token: refresh_token.toString(),
    };
  }

  async userLogout(sessionId: string): Promise<{ message: string }> {
    const session = await this.userSessionRepository.findOneBy({
      session_id: sessionId,
    });
    if (session) {
      session.is_active = false;
      await this.userSessionRepository.save(session);
    }
    return { message: 'You have been successfully logged out.' };
  }

  async adminLogout(sessionId: string): Promise<{ message: string }> {
    const session = await this.adminSessionRepository.findOneBy({
      session_id: sessionId,
    });
    if (session) {
      session.is_active = false;
      await this.adminSessionRepository.save(session);
      await this.auditLogService.logAction({
        user_id: session.admin_user_id.toString(),
        action: 'ADMIN_LOGOUT',
        module: 'AuthService',
        serviceName: 'user-management',
        details: { sessionId: sessionId },
      });
    }
    return { message: 'You have been successfully logged out.' };
  }

  async resetAdminMfa(
    adminUserIdToReset: string,
    performedByAdminId: string,
  ): Promise<{ message: string }> {
    const securitySettings =
      await this.adminSecuritySettingRepository.findOneBy({
        admin_user_id: adminUserIdToReset,
      });

    if (!securitySettings || !securitySettings.mfa_secret) {
      return {
        message: 'MFA was not configured for this user. No action taken.',
      };
    }

    securitySettings.mfa_enabled = false;
    securitySettings.mfa_secret = null;
    securitySettings.mfa_temp_secret = null;
    await this.adminSecuritySettingRepository.save(securitySettings);

    await this.auditLogService.logAction({
      user_id: performedByAdminId,
      action: 'ADMIN_MFA_RESET',
      module: 'AuthService',
      serviceName: 'user-management',
      details: { targetUserId: adminUserIdToReset },
    });

    return { message: `MFA has been successfully reset for the user.` };
  }

  async validateAndLoginAdminWithSso(
    req: Request,
    profile: { provider: string; id: string; email: string },
  ) {
    let adminUser = await this.adminUserRepository.findOne({
      where: {
        ssoProvider: profile.provider,
        ssoProviderId: profile.id,
      },
    });

    if (adminUser) {
      return this.issueAdminTokens(req, adminUser);
    }

    adminUser = await this.adminUserRepository.findOne({
      where: { user_name: profile.email },
    });

    if (!adminUser || adminUser.ssoProviderId) {
      await this.auditLogService.logAction({
        action: 'ADMIN_SSO_LOGIN_FAILURE',
        module: 'AuthService',
        serviceName: 'user-management',
        details: {
          reason: 'Unauthorized SSO attempt for email',
          email: profile.email,
          provider: profile.provider,
        },
      });
      throw new ForbiddenException(
        'This account is not authorized for Admin SSO access.',
      );
    }

    adminUser.ssoProvider = profile.provider;
    adminUser.ssoProviderId = profile.id;
    const updatedAdmin = await this.adminUserRepository.save(adminUser);

    await this.auditLogService.logAction({
      user_id: updatedAdmin.admin_user_id.toString(),
      action: 'ADMIN_SSO_LINK_SUCCESS',
      module: 'AuthService',
      serviceName: 'user-management',
      details: { provider: profile.provider },
    });

    return this.issueAdminTokens(req, updatedAdmin);
  }
}
