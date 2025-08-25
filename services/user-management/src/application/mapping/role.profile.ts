import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Role } from 'src/domain/entities/role.entity';
import { GetRoleDto } from 'src/presentation/dtos/get-role.dto';
import { Permission } from 'src/domain/entities/permission.entity';
import { PermissionDto } from 'src/presentation/dtos/permission.dto';

@Injectable()
export class RoleProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      // Map Permission -> PermissionDto (simple, will be auto-mapped)
      createMap(mapper, Permission, PermissionDto);

      // Map Role -> GetRoleDto
      createMap(mapper, Role, GetRoleDto,
        // Because we added @AutoMap() to the Role entity, the simple properties
        // (role_id, name, description) will now be mapped automatically.
        // We only need to provide the special rule for the 'permissions' property.
        forMember(
          (destination) => destination.permissions,
          mapFrom((source) => 
            source.rolePermissions ? source.rolePermissions.map(rp => rp.permission) : []
          )
        )
      );
    };
  }
}