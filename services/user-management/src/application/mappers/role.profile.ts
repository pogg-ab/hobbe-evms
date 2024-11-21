import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Role } from 'src/domain/entities/role.entity';
import { CreateRoleDto } from 'src/presentation/dtos/create-role.dto';

@Injectable()
export class RoleProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
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
