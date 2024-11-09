import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AdminService } from 'src/application/services/admin.service';
import { GetAllRolesQuery } from '../../queries/admin/get-all-roles.query';

@QueryHandler(GetAllRolesQuery)
export class GetAllRolesQueryHandler
  implements IQueryHandler<GetAllRolesQuery>
{
  constructor(private readonly AdminService: AdminService) {}

  async execute(): Promise<any> {
    const roles = await this.AdminService.findAllRoles();
    return roles;
  }
}
