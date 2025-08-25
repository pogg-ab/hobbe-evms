import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Role } from 'src/domain/entities/role.entity';
import { CreateRoleDto } from 'src/presentation/dtos/create-role.dto';
import { UpdateRoleDto } from 'src/presentation/dtos/update-role.dto'; // <-- 1. IMPORT THIS

@Injectable()
export class RoleProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      // This is the original mapping for creating a role
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

      // --- ADD THE NEW MAPPING FOR UPDATING A ROLE ---
      createMap(
        mapper,
        UpdateRoleDto,
        Role,
        forMember(
          (destination) => destination.name,
          mapFrom((src: UpdateRoleDto) => src.name),
        ),
        forMember(
          (destination) => destination.description,
          mapFrom((src: UpdateRoleDto) => src.description),
        ),
      );
    };
  }
}