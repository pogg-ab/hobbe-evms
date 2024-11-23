import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllRolesQuery } from 'src/application/queries/role-permission/get-all-roles.query';
import { AdminService } from 'src/application/services/admin.service';

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
