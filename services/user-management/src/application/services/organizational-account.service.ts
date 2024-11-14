import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Email } from 'src/domain/entities/email.entity';
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
import { EmailRepositoryImpl } from 'src/infrastructure/persistence/repositories/email.repository.impl';
import { UpdateOrganizationalAccountDto } from 'src/presentation/dtos/update-organizational-account.dto';
import { CreateOrganizationalAccountDto } from '../../presentation/dtos/create-organizational-account.dto';

@Injectable()
export class OrganizationalAccountService {
  constructor(
    @Inject(ORGANIZATIONAL_ACCOUNT_REPOSITORY_TOKEN)
    private readonly organizationalAccountRepository: IOrganizationalAccountRepository,

    @Inject(OWNER_REPOSITORY_TOKEN)
    private readonly ownerRepository: IOwnerRepository,

    @Inject(KYC_REPOSITORY_TOKEN)
    private readonly kycRepository: IKYCRepository,

    @Inject(SOCIAL_MEDIA_REPOSITORY_TOKEN)
    private readonly socialMediaRepository: ISocialMediaRepository,

    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,

    private readonly emailRepository: EmailRepositoryImpl,

    @InjectMapper() private readonly mapper: Mapper,
  ) {}
  async create(createOrganizationalAccountDto: CreateOrganizationalAccountDto) {
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
    const savedOwner = await this.ownerRepository.create(owner);

    const kyc = this.mapper.map(
      createOrganizationalAccountDto,
      CreateOrganizationalAccountDto,
      KYC,
    );
    const savedKYC = await this.kycRepository.create(kyc);

    organizationalAccount.owner = savedOwner.owner_id;
    organizationalAccount.kyc = savedKYC.kyc_id;

    const savedAccount = await this.organizationalAccountRepository.create(
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
    await this.userRepository.create(user);

    const socialMedia = this.mapper.map(
      createOrganizationalAccountDto,
      CreateOrganizationalAccountDto,
      SocialMedia,
    );

    socialMedia.organizational_account = savedAccount.organizational_account_id;

    await this.socialMediaRepository.create(socialMedia);

    const otp = this.generateOtp();
    const email = this.createOtpEmail(
      createOrganizationalAccountDto.companyEmail,
      otp,
    );
    await this.emailRepository.save(email);

    return savedAccount;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
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

  findAll() {
    return this.organizationalAccountRepository.find();
  }

  async findOneById(id: string): Promise<OrganizationalAccount> {
    const role = await this.organizationalAccountRepository.findOneById(id);
    return role;
  }

  update(
    id: number,
    updateOrganizationalAccountDto: UpdateOrganizationalAccountDto,
  ) {
    return `This action updates a #${id} organizationalAccount`;
  }

  async deleteOrganizationalAccount(id: string): Promise<void> {
    await this.organizationalAccountRepository.delete(id);
  }
}
