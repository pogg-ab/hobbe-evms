import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { AdminUser } from 'src/domain/entities/admin-user.entity';
import { Role } from 'src/domain/entities/role.entity';
import { CreateAdminUserAccountDto } from 'src/presentation/dtos/create-admin-user-account.dto';
import { CreateRoleDto } from 'src/presentation/dtos/create-role.dto';

@Injectable()
export class AdminUserProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CreateAdminUserAccountDto,
        AdminUser,
        forMember(
          (destination) => destination.user_name,
          mapFrom((src: CreateAdminUserAccountDto) => src.emailAddress),
        ),

        forMember(
          (destination) => destination.updated_at,
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
    };
  }
}
