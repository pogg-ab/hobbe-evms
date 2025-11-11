import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { SubAccount } from 'src/domain/entities/sub-account.entity';
import { User } from 'src/domain/entities/user.entity';
import { SubAccountStatus } from 'src/domain/value-objects/sub-account-status.value-object';
import { CreateSubAccountDto } from 'src/presentation/dtos/create-sub-account.dto';
import { UpdateSubAccountDto } from 'src/presentation/dtos/update-sub-account.dto';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class SubAccountProfile extends AutomapperProfile {
  constructor(
    @InjectMapper() mapper: Mapper,
    @InjectRepository(User)
    private userRepo: Repository<User>,
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
          (destination) => destination.status,
          mapFrom(() => new SubAccountStatus('active')),
        ),
        forMember(
          (destination) => destination.expire_date,
          mapFrom((src) => src.expire_date),
        ),
        forMember(
          (destination) => destination.privileges,
          mapFrom((src) => src.privileges),
        ),
        forMember(
          (destination) => destination.created_at,
          mapFrom(() => new Date()),
        ),
        forMember(
          (destination) => destination.updated_at,
          mapFrom(() => new Date()),
        ),
        forMember(
          (destination) => destination.generated_user_id,
          mapFrom(() => uuidv4()),
        ),
      );

      createMap(
        mapper,
        UpdateSubAccountDto,
        SubAccount,
        forMember(
          (dest) => dest.status,
          mapFrom((src) => {
            if (!src.status) return undefined;
            return typeof src.status === 'string'
              ? SubAccountStatus.create(src.status as any)
              : src.status;
          }),
        ),
        forMember(
          (dest) => dest.privileges,
          mapFrom((src) => src.privileges),
        ),
        forMember(
          (dest) => dest.expire_date,
          mapFrom((src) => src.expire_date),
        ),
        forMember(
          (dest) => dest.updated_at,
          mapFrom(() => new Date()),
        ),
      );
    };
  }

  private async getUser(userId: string) {
    if (userId) {
      const user = await this.userRepo.findOne({
        where: { user_id: userId },
      });
      return user || null;
    }
    return null;
  }
}
