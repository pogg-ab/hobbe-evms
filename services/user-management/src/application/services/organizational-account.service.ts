import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
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

    @InjectMapper() private readonly mapper: Mapper,
  ) {}
  async create(createOrganizationalAccountDto: CreateOrganizationalAccountDto) {
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

    const socialMedia = this.mapper.map(
      createOrganizationalAccountDto,
      CreateOrganizationalAccountDto,
      SocialMedia,
    );
    const savedSocialMedia =
      await this.socialMediaRepository.create(socialMedia);

    const user = this.mapper.map(
      createOrganizationalAccountDto,
      CreateOrganizationalAccountDto,
      User,
    );
    // user.password = await this.hashPassword(
    //   createOrganizationalAccountDto.password,
    // );
    await this.userRepository.create(user);
    organizationalAccount.owner = savedOwner.owner_id;
    organizationalAccount.kyc = savedKYC.kyc_id;

    const savedAccount = await this.organizationalAccountRepository.create(
      organizationalAccount,
    );

    return savedAccount;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  findAll() {
    return `This action returns all organizationalAccount`;
  }

  findOne(id: number) {
    return `This action returns a #${id} organizationalAccount`;
  }

  update(
    id: number,
    updateOrganizationalAccountDto: UpdateOrganizationalAccountDto,
  ) {
    return `This action updates a #${id} organizationalAccount`;
  }

  remove(id: number) {
    return `This action removes a #${id} organizationalAccount`;
  }
}
