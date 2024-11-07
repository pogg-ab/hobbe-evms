import { Inject, Injectable } from '@nestjs/common';
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
  ) {}
  async create(createOrganizationalAccountDto: CreateOrganizationalAccountDto) {
    return 'This action adds a new organizationalAccount';
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
