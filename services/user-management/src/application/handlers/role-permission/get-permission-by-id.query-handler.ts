// In src/application/handlers/role-permission/get-permission-by-id.query-handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/domain/entities/permission.entity';
import { Repository } from 'typeorm';
import { GetPermissionByIdQuery } from '../../queries/role-permission/get-permission-by-id.query';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetPermissionByIdQuery)
export class GetPermissionByIdQueryHandler
  implements IQueryHandler<GetPermissionByIdQuery>
{
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async execute(query: GetPermissionByIdQuery): Promise<Permission> {
    const permission = await this.permissionRepository.findOneBy({
      permission_id: query.id,
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID "${query.id}" not found`);
    }

    return permission;
  }
}
