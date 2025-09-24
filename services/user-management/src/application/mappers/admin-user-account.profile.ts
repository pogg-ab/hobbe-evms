import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { AdminUserAccount } from 'src/domain/entities/admin-user-account.entity';
import { AdminUser } from 'src/domain/entities/admin-user.entity';
import { Role } from 'src/domain/entities/role.entity';
import { CreateRoleDto } from 'src/presentation/dtos/create-role.dto';
import { CreateAdminUserAccountDto } from '../../presentation/dtos/create-admin-user-account.dto';
import { UpdateAdminUserAccountDto } from 'src/presentation/dtos/update-admin-user-account.dto';

@Injectable()
export class AdminUserAccountProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CreateAdminUserAccountDto,
        AdminUserAccount,
        forMember(
          (destination) => destination.first_name,
          mapFrom((src) => src.firstName),
        ),
        forMember(
          (destination) => destination.email_address,
          mapFrom((src) => src.emailAddress),
        ),
        forMember(
          (destination) => destination.last_name,
          mapFrom((src) => src.lastName),
        ),
        forMember(
          (destination) => destination.phone_number,
          mapFrom((src) => src.phoneNumber),
        ),

        forMember(
          (destination) => destination.profile_image,
          mapFrom((src) => src.profile_image),
        ),

        forMember(
          (destination) => destination.created_date,
          mapFrom(() => new Date()),
        ),
        forMember(
          (destination) => destination.updated_date,
          mapFrom(() => new Date()),
        ),
      );

      createMap(
        mapper,
        CreateAdminUserAccountDto,
        AdminUser,
        forMember(
          (destination) => destination.user_name,
          mapFrom((src: CreateAdminUserAccountDto) => src.emailAddress),
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

      createMap(
        mapper,
        CreateRoleDto,
        Role,
        forMember(
          (destination) => destination.name,
          mapFrom((src: CreateRoleDto) => src.name),
        ),
        forMember(
          (destination) => destination.description,
          mapFrom((src: CreateRoleDto) => src.description),
        ),
      );

      createMap(
        mapper,
        UpdateAdminUserAccountDto,
        AdminUserAccount,
        forMember(
          (dest) => dest.first_name,
          mapFrom((src) => src.firstName),
        ),
        forMember(
          (dest) => dest.last_name,
          mapFrom((src) => src.lastName),
        ),
        forMember(
          (dest) => dest.email_address,
          mapFrom((src) => src.emailAddress),
        ),
        forMember(
          (dest) => dest.phone_number,
          mapFrom((src) => src.phoneNumber),
        ),
        forMember(
          (dest) => dest.profile_image,
          mapFrom((src) => src.profile_image),
        ),
        forMember(
          (dest) => dest.updated_date,
          mapFrom(() => new Date()),
        ),
      );
    };
  }
}
