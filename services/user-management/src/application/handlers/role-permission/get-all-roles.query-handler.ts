import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllRolesQuery } from 'src/application/queries/role-permission/get-all-roles.query';
import { AdminService } from 'src/application/services/admin.service';
import { GetRoleDto } from 'src/presentation/dtos/get-role.dto';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Role } from 'src/domain/entities/role.entity';

@QueryHandler(GetAllRolesQuery)
export class GetAllRolesQueryHandler implements IQueryHandler<GetAllRolesQuery, GetRoleDto[]> {
  constructor(
    private readonly adminService: AdminService,
    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}

  async execute(): Promise<GetRoleDto[]> {
    // 1. This call now returns Roles with their permissions loaded, thanks to our change in AdminService.
    const rolesFromDb = await this.adminService.findAllRoles();

    // 2. We map the rich entity objects into our clean DTOs for the API response.
    return this.mapper.mapArray(rolesFromDb, Role, GetRoleDto);
  }
}