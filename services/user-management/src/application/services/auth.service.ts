import { HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AdminUserAuth } from 'src/domain/entities/admin-user-auth.entity';
import { AdminUserRole } from 'src/domain/entities/admin-user-role.entity';
import { AdminUser } from 'src/domain/entities/admin-user.entity';
import { Auth } from 'src/domain/entities/auth.entity';
import { Email } from 'src/domain/entities/email.entity';
import { UserRole } from 'src/domain/entities/user-role.entity';
import { User } from 'src/domain/entities/user.entity';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { AccessToken } from 'src/domain/value-objects/access-token.value-object';
import { RefreshToken } from 'src/domain/value-objects/refresh-token.value-object';
import { EmailRepositoryImpl } from 'src/infrastructure/persistence/repositories/email.repository.impl';
import { Repository } from 'typeorm';
import { EmailService } from './email.service';
import { SMSSenderService } from './sms-sender.service';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PersonalAccount)
    private readonly personalAccountRepository: Repository<PersonalAccount>,
    @InjectRepository(OrganizationalAccount)
    private readonly organizationalAccountRepository: Repository<OrganizationalAccount>,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private jwtService: JwtService,
    private readonly emailRepository: EmailRepositoryImpl,
    private readonly smsSenderService: SMSSenderService,
    private readonly emailService: EmailService,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(AdminUser)
    private readonly adminUserRepository: Repository<AdminUser>,
    @InjectRepository(AdminUserAuth)
    private readonly adminUserAuthRepository: Repository<AdminUserAuth>,
    @InjectRepository(AdminUserRole)
    private readonly adminUserRoleRepository: Repository<AdminUserRole>,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userWithAccountRepository: IUserRepository,
  ) { }

  async validateUser(user_name: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { user_name } });
    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        if (!user.is_active) {
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
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          success: false,
          message:
            'Invalid credentials. Please check your username and password.',
        };
      }
    }
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
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          success: false,
          message:
            'Invalid credentials. Please check your username and password.',
        };
      }
    }
    return {
      statusCode: HttpStatus.NOT_FOUND,
      success: false,
      message: 'User not found. Please check your username.',
    };
  }

  async login(user: any, rememberMe: boolean) {
    const payload = { username: user.user.user_name, sub: user.user.user_id };
    const access_token = new AccessToken(
      this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1d',
      }),
    );
    let refresh_token: string | null = null;
    if (rememberMe) {
      const refreshPayload = { username: user.user_name, sub: user.user_id };
      refresh_token = this.jwtService.sign(refreshPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '30d',
      });
    }
    const token_expires_at = rememberMe
      ? new Date(new Date().getTime() + 30 * 86400000) // 1 month expiration for refresh token
      : new Date(new Date().getTime() + 86400000);

    let auth = await this.authRepository.findOne({
      where: { user_id: user.user.user_id },
    });

    if (auth) {
      auth.user_id = user.user.user_id;
      auth.access_token = access_token.toString();
      auth.refresh_token = refresh_token ? refresh_token.toString() : '';
      auth.token_expires_at = token_expires_at;
      auth.last_login = new Date();

      await this.authRepository.save(auth);
    } else {
      auth = new Auth();
      auth.user_id = user.user.user_id;
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

  async requestPasswordReset(user_name: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { user_name } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (!user.is_active) {
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

    const email = this.createPasswordResetEmail(user.user_name, resetToken);
    await this.emailRepository.save(email);

    return { message: 'Password reset token sent to your email.' };
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

  private createPasswordResetEmail(recipient: string, token: string): Email {
    const email = new Email();
    email.recipient = recipient;
    email.subject = 'Password Reset Request';
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

    const expiryTime = resetTokenExpiry.toUTCString();
    email.body = `
    <html>
      <body>
        <p>Dear ${recipient},</p>
        <p>We have received a request to reset your password for your Hobbe EVMS account. If you did not make this request, please ignore this email.</p>
        <p>To reset your password, please click the button below:</p>
        <p><a href="hobbe_evms_app://reset-password?token=${token}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Your Password</a></p>
        <p>The reset link will expire at <strong>${expiryTime}</strong>. If you do not reset your password by this time, the link will no longer be valid.</p>
        <p>If you have any trouble, feel free to contact our support team for assistance.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>Hobbe EVMS Team</strong></p>
      </body>
    </html>
  `;
    email.created_at = new Date();
    email.updated_at = new Date();
    email.sent_at = null;
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
        const newExpiryDate = new Date(now.getTime() + 30 * 86400000); // New expiry for the refresh token (e.g., 1 month)

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
          expiresIn: '1d', // Access token expiry: 1 day
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

  async adminUserLogin(user: any) {
    const payload = { username: user.user_name, sub: user.user_id };
    const access_token = new AccessToken(
      this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1d',
      }),
    );
    const refresh_token = new RefreshToken(this.generateRefreshToken());
    const token_expires_at = new Date(new Date().getTime() + 86400000); // 1 hour expiration
    let auth = await this.adminUserAuthRepository.findOne({
      where: { admin_user_id: user.user.admin_user_id },
    });

    if (auth) {
      auth.admin_user_id = user.user.admin_user_id;
      auth.access_token = access_token.toString();
      auth.refresh_token = refresh_token.toString();
      auth.token_expires_at = token_expires_at;
      auth.last_login = new Date();

      await this.adminUserAuthRepository.save(auth);
    } else {
      auth = new AdminUserAuth();
      auth.admin_user_id = user.user.admin_user_id;
      auth.access_token = access_token.toString();
      auth.refresh_token = refresh_token.toString();
      auth.token_expires_at = token_expires_at;
      auth.last_login = new Date();

      await this.adminUserAuthRepository.save(auth);
    }
    return {
      access_token: access_token.toString(),
      refresh_token: refresh_token.toString(),
    };
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

    const organizationalAccount = await this.organizationalAccountRepository.findOne({
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


      const smsMessage = `Your OTP for Hobbe EVMS registration is ${otp}. Please enter this code to complete your registration. The code will expire in 10 minutes.`;
      const phoneNumber = await this.getPhoneNumberByAccount(user);

      const smsResponse = await this.smsSenderService.sendSMS(
        phoneNumber,
        smsMessage,
        user,
        'OTP',
        null,
      );

      if ('error' in smsResponse) {
        const email = this.createOtpEmail(user.user_name, otp);
        const emailResponse = await this.emailService.sendEmail(email);

        if (!emailResponse) {
          throw new InternalServerErrorException(
            `Failed to send OTP via SMS and email. ${smsResponse.error ? `SMS failed: ${smsResponse.error}` : ''} ${emailResponse ? '' : 'Email sending failed.'}`
          );
        }

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

  private createOtpEmail(recipient: string, otp: string): Email {
    const email = new Email();
    email.recipient = recipient;
    email.subject = 'Your OTP Code from Hobbe EVMS';
    email.body = otp;
    email.created_at = new Date();
    email.updated_at = new Date();
    email.sent_at = null;
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
}
