import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AdminService } from 'src/application/services/admin.service';
import { Permission } from 'src/domain/entities/permission.entity';
import { GetAllPermissionQuery } from '../../queries/admin/get-all-permissions.query';

@QueryHandler(GetAllPermissionQuery)
export class GetAllPermissionQueryHandler
  implements IQueryHandler<GetAllPermissionQuery>
{
  constructor(private readonly adminService: AdminService) {}

  async execute(query: GetAllPermissionQuery): Promise<Permission[]> {
    return this.adminService.findAllPermissions();
  }
}
