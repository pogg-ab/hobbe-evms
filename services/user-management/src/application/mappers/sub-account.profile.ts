import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { SubAccount } from 'src/domain/entities/sub-account.entity';
import { SubAccountStatus } from 'src/domain/value-objects/sub-account-status.value-object';
import { CreateSubAccountDto } from 'src/presentation/dtos/create-sub-account.dto';
import { Repository } from 'typeorm';

@Injectable()
export class SubAccountProfile extends AutomapperProfile {
  constructor(
    @InjectMapper() mapper: Mapper,
    @InjectRepository(OrganizationalAccount)
    private organizationalAccountRepo: Repository<OrganizationalAccount>,
    @InjectRepository(PersonalAccount)
    private personalAccountRepo: Repository<PersonalAccount>,
  ) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CreateSubAccountDto,
        SubAccount,
        forMember(
          async (destination) => destination.organizational_account_owner,
          mapFrom(
            async (src) => await this.getOrganizationalAccount(src.account_id),
          ),
        ),
        forMember(
          async (destination) => destination.personal_account_owner,
          mapFrom(async (src) => await this.getPersonalAccount(src.account_id)),
        ),
        forMember(
          async (destination) => destination.organizational_account_main,
          mapFrom(
            async (src) => await this.getOrganizationalAccount(src.user_id),
          ),
        ),
        forMember(
          async (destination) => destination.personal_account_main,
          mapFrom(async (src) => await this.getPersonalAccount(src.user_id)),
        ),
        forMember(
          (destination) => destination.status,
          mapFrom(() => new SubAccountStatus('active')),
        ),
        forMember(
          (destination) => destination.expire_date,
          mapFrom((src) => src.expire_date),
        ),
        forMember(
          (destination) => destination.created_at,
          mapFrom(() => new Date()),
        ),
        forMember(
          (destination) => destination.updated_at,
          mapFrom(() => new Date()),
        ),
      );
    };
  }

  private async getOrganizationalAccount(accountId: string) {
    if (accountId) {
      const organizationalAccount =
        await this.organizationalAccountRepo.findOne({
          where: { organizational_account_id: accountId },
        });
      return organizationalAccount || null;
    }
    return null;
  }

  private async getPersonalAccount(accountId: string) {
    if (accountId) {
      const personalAccount = await this.personalAccountRepo.findOne({
        where: { personal_account_id: accountId },
      });
      return personalAccount || null;
    }
    return null;
  }
}
