import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Email } from 'src/domain/entities/email.entity';
import { UserRole } from 'src/domain/entities/user-role.entity';
import { User } from 'src/domain/entities/user.entity';
import { EmailRepositoryImpl } from 'src/infrastructure/persistence/repositories/email.repository.impl';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly emailRepository: EmailRepositoryImpl,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
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

  async login(user: any) {
    const payload = { username: user.user_name, sub: user.user_id };
    return {
      access_token: this.jwtService.sign(payload),
    };
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
}
