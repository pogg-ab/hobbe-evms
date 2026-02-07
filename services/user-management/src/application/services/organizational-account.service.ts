import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { KYC } from 'src/domain/entities/kyc.entity';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { Owner } from 'src/domain/entities/owner.entity';
import { SocialMedia } from 'src/domain/entities/social-media.entity';
import { User } from 'src/domain/entities/user.entity';
import { IKYCRepository } from 'src/domain/repositories/kyc.repository';
import { KYC_REPOSITORY_TOKEN } from 'src/domain/repositories/kyc.repository.token';
import { IOrganizationalAccountRepository } from 'src/domain/repositories/organizational-account.repository';
import { ORGANIZATIONAL_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/organizational-account.repository.token';
import { IOwnerRepository } from 'src/domain/repositories/owner.repository';
import { OWNER_REPOSITORY_TOKEN } from 'src/domain/repositories/owner.repository.token';
import { ISocialMediaRepository } from 'src/domain/repositories/social-media.repository';
import { SOCIAL_MEDIA_REPOSITORY_TOKEN } from 'src/domain/repositories/social-media.repository.token';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { OrganizationalAccountID } from 'src/domain/value-objects/organizational-account-id.value-object';
import { MessageProducerService } from 'src/infrastructure/kafka/message.producer.service';
import { NotificationConfigService } from 'src/infrastructure/notification-config.service';
import { MessageType } from 'src/presentation/dtos/create-sms.dto';
import { SendEmailVerificationDto } from 'src/presentation/dtos/send-email-verification.dto';
import { UpdateOrganizationalAccountDto } from 'src/presentation/dtos/update-organizational-account.dto';
import { VerifyEmailResponse } from 'src/presentation/dtos/verify-email-response.interface';
import { VerifyEmailDto } from 'src/presentation/dtos/verify-email.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateOrganizationalAccountDto } from '../../presentation/dtos/create-organizational-account.dto';
import { GroupAccount } from 'src/domain/entities/group-account.entity';
import { GROUP_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/group-account.repository.token';
import { IGroupAccountRepository } from 'src/domain/repositories/group-account.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/domain/entities/user-role.entity';
import { ROLE_REPOSITORY_TOKEN } from 'src/domain/repositories/role.repository.token';
import { IRoleRepository } from 'src/domain/repositories/role.repository';
import { Role } from 'src/domain/entities/role.entity';
import { USER_ROLE_REPOSITORY_TOKEN } from 'src/domain/repositories/user-role.repository.token';
import { IUserRoleRepository } from 'src/domain/repositories/user-role.repository';

@Injectable()
export class OrganizationalAccountService {
  constructor(
    @Inject(ORGANIZATIONAL_ACCOUNT_REPOSITORY_TOKEN)
    private readonly organizationalAccountRepository: IOrganizationalAccountRepository,

    @Inject(OWNER_REPOSITORY_TOKEN)
    private readonly ownerRepository: IOwnerRepository,

    @Inject(KYC_REPOSITORY_TOKEN)
    private readonly kycRepository: IKYCRepository,

    @Inject(GROUP_ACCOUNT_REPOSITORY_TOKEN)
    private readonly groupAccountRepository: IGroupAccountRepository,

    @Inject(SOCIAL_MEDIA_REPOSITORY_TOKEN)
    private readonly socialMediaRepository: ISocialMediaRepository,

    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,

    @Inject(ROLE_REPOSITORY_TOKEN)
    private readonly roleRepository: IRoleRepository,

    @Inject(USER_ROLE_REPOSITORY_TOKEN)
    private readonly userRoleRepository: IUserRoleRepository,

    @InjectRepository(User)
    private userEntityRepository: Repository<User>,

    private dataSource: DataSource,

    @InjectMapper() private readonly mapper: Mapper,
    private readonly messageProducerService: MessageProducerService,
    private readonly notificationConfigService: NotificationConfigService,
  ) {}
  async create(createOrganizationalAccountDto: CreateOrganizationalAccountDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (
        createOrganizationalAccountDto.password !==
        createOrganizationalAccountDto.confirmPassword
      ) {
        throw new BadRequestException(
          'Password and Confirm Password do not match',
        );
      }

      const organizationalAccount = this.mapper.map(
        createOrganizationalAccountDto,
        CreateOrganizationalAccountDto,
        OrganizationalAccount,
      );

      const owner = this.mapper.map(
        createOrganizationalAccountDto,
        CreateOrganizationalAccountDto,
        Owner,
      );
      const savedOwner = await this.ownerRepository.create(
        queryRunner.manager,
        owner,
      );

      const kyc = this.mapper.map(
        createOrganizationalAccountDto,
        CreateOrganizationalAccountDto,
        KYC,
      );
      const savedKYC = await this.kycRepository.create(
        queryRunner.manager,
        kyc,
      );

      organizationalAccount.owner = savedOwner.owner_id;
      organizationalAccount.kyc = savedKYC.kyc_id;

      const savedAccount = await this.organizationalAccountRepository.create(
        queryRunner.manager,
        organizationalAccount,
      );

      const user = this.mapper.map(
        createOrganizationalAccountDto,
        CreateOrganizationalAccountDto,
        User,
      );

      user.password = await this.hashPassword(
        createOrganizationalAccountDto.password,
      );
      user.organizational_account = savedAccount.organizational_account_id;

      const existingUser = await this.userEntityRepository.findOne({
        where: { user_name: user.user_name },
      });
      if (existingUser) {
        throw new ConflictException(
          `A user with email ${user.user_name} already exists.`,
        );
      }

      const newUser = await this.userRepository.create(
        queryRunner.manager,
        user,
      );

      if (user.is_primary_account === false) {
        const groupAccount = this.mapper.map(
          createOrganizationalAccountDto,
          CreateOrganizationalAccountDto,
          GroupAccount,
        );

        if (!groupAccount.primary_user_id) {
          throw new BadRequestException(
            'Primary user ID is required for creating a group account.',
          );
        }

        const primaryUser = await this.userRepository.findById(
          groupAccount.primary_user_id.toString(),
        );
        if (!primaryUser) {
          throw new BadRequestException(
            `No user found with primary_user_id: ${groupAccount.primary_user_id}`,
          );
        }

        const existingGroupAccount =
          await this.groupAccountRepository.findByPrimaryAndLinked(
            groupAccount.primary_user_id.toString(),
            newUser.user_id.toString(),
          );

        if (existingGroupAccount) {
          throw new ConflictException(
            `A group account already exists between primary_user_id ${groupAccount.primary_user_id} and linked_user_id ${newUser.user_id}.`,
          );
        }

        groupAccount.linked_user_id = newUser.user_id;
        await this.groupAccountRepository.create(
          queryRunner.manager,
          groupAccount,
        );
      }

      const socialMedia = this.mapper.map(
        createOrganizationalAccountDto,
        CreateOrganizationalAccountDto,
        SocialMedia,
      );
      socialMedia.organizational_account =
        savedAccount.organizational_account_id;

      await this.socialMediaRepository.create(queryRunner.manager, socialMedia);

      const role = await this.getRoleByName('User');

      const userRole = new UserRole();
      userRole.user_id = newUser.user_id;
      userRole.role = role;
      await this.userRoleRepository.create(queryRunner.manager, userRole);

      await queryRunner.commitTransaction();

      const otp = this.generateOtp();
      if (this.notificationConfigService.useSmsNotification) {
        await this.messageProducerService.sendSmsToKafka({
          recipient: createOrganizationalAccountDto.companyPhoneNumber,
          message: `Your OTP for Hobbe EVMS registration is ${otp}. Please enter this code to complete your registration. The code will expire in 10 minutes.`,
          messageType: MessageType.OTP,
        });
      } else {
        const email = this.createOtpEmail(
          createOrganizationalAccountDto.companyEmail,
          otp,
        );
        await this.messageProducerService.sendEmailToKafka(email);
      }

      return savedAccount;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) throw error;
      if (error instanceof HttpException)
        throw new HttpException(error.message, error.getStatus());

      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the account.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async getRoleByName(roleName: string): Promise<Role> {
    try {
      const role = await this.roleRepository.findOneBy({ name: roleName });
      if (!role) {
        throw new HttpException(
          `Role ${roleName} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      return role;
    } catch (error) {
      throw new HttpException(
        `Error fetching role: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
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

  findAll() {
    return this.organizationalAccountRepository.find();
  }

  async findOneById(
    id: OrganizationalAccountID,
  ): Promise<OrganizationalAccount> {
    const role = await this.organizationalAccountRepository.findOneById(id);
    return role;
  }

  update(
    id: OrganizationalAccountID,
    updateOrganizationalAccountDto: UpdateOrganizationalAccountDto,
  ) {
    return `This action updates a #${id} organizationalAccount`;
  }

  async deleteOrganizationalAccount(id: string): Promise<void> {
    await this.organizationalAccountRepository.delete(id);
  }

  async sendEmailVerificationDb(
    sendEmailVerificationDto: SendEmailVerificationDto,
  ): Promise<any> {
    try {
      const organizationalAccount =
        await this.organizationalAccountRepository.findByEmail(
          sendEmailVerificationDto.email_address,
        );
      if (!organizationalAccount) {
        throw new HttpException(
          'Personal Account not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const otp = this.generateOtp();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

      organizationalAccount.email_verification_token = otp;
      organizationalAccount.email_verification_expires = otpExpiry;
      await this.organizationalAccountRepository.update(
        organizationalAccount.organizational_account_id,
        organizationalAccount,
      );

      const email = this.createOtpEmail(
        sendEmailVerificationDto.email_address,
        otp,
      );
      await this.messageProducerService.sendEmailToKafka(email);

      return { message: 'Email verification code sent successfully.' };
    } catch (error) {
      throw new HttpException(
        `Error sending email verification code: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async sendEmailVerification(
    sendEmailVerificationDto: SendEmailVerificationDto,
  ): Promise<any> {
    try {
      const otp = this.generateOtp();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);
      const email = this.createOtpEmail(
        sendEmailVerificationDto.email_address,
        otp,
      );
      await this.messageProducerService.sendEmailToKafka(email);

      return { message: 'Email verification code sent successfully.' };
    } catch (error) {
      throw new HttpException(
        `Error sending email verification code: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
  ): Promise<VerifyEmailResponse> {
    const organizationalAccount =
      await this.organizationalAccountRepository.findByEmail(
        verifyEmailDto.email,
      );

    if (!organizationalAccount) {
      return {
        success: false,
        message: 'Account not found.',
        statusCode: 404,
      };
    }

    if (
      organizationalAccount.email_verification_token !==
      verifyEmailDto.verificationCode
    ) {
      return {
        success: false,
        message: 'Invalid verification code.',
        statusCode: 400,
      };
    }

    const currentTime = new Date();
    const tokenExpiryTime = new Date(
      organizationalAccount.email_verification_expires,
    );
    if (currentTime > tokenExpiryTime) {
      return {
        success: false,
        message: 'Verification token has expired.',
        statusCode: 410,
      };
    }

    organizationalAccount.is_email_verified = true;
    organizationalAccount.email_verification_token = null;
    await this.organizationalAccountRepository.update(
      organizationalAccount.organizational_account_id,
      organizationalAccount,
    );

    return {
      success: true,
      message: 'Email successfully verified.',
      statusCode: 200,
    };
  }
}
