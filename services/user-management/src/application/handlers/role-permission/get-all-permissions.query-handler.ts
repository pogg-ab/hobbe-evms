import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllPermissionQuery } from 'src/application/queries/role-permission/get-all-permissions.query';
import { AdminService } from 'src/application/services/admin.service';
import { Permission } from 'src/domain/entities/permission.entity';

@QueryHandler(GetAllPermissionQuery)
export class GetAllPermissionQueryHandler
  implements IQueryHandler<GetAllPermissionQuery>
{
  constructor(private readonly adminService: AdminService) {}

  async execute(query: GetAllPermissionQuery): Promise<Permission[]> {
    return this.adminService.findAllPermissions();
  }
}
