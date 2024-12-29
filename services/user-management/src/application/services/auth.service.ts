import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private jwtService: JwtService,
    private readonly emailRepository: EmailRepositoryImpl,
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
  ) {}

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

      const email = this.createOtpEmail(user.user_name, otp);
      await this.emailRepository.save(email);

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
