import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Role } from 'src/domain/entities/role.entity';
import { User } from 'src/domain/entities/user.entity';
import { CreateRoleDto } from 'src/presentation/dtos/create-role.dto';
import { CreatePersonalAccountDto } from '../../presentation/dtos/create-personal-account.dto'; // Adjust the path

@Injectable()
export class UserProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CreatePersonalAccountDto,
        User,

        forMember(
          (destination) => destination.user_name,
          mapFrom((src: CreatePersonalAccountDto) => src.emailAddress),
        ),
        forMember(
          (destination) => destination.password,
          mapFrom((src: CreatePersonalAccountDto) => src.password),
        ),
        forMember(
          (destination) => destination.is_active,
          mapFrom(() => false),
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
