import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAllAdminUsersQuery } from 'src/application/queries/admin-user-account/find-all-admin-users.query';
import { AdminUserAccountService } from 'src/application/services/admin-user-account.service';
import { AdminUser } from 'src/domain/entities/admin-user.entity';

@QueryHandler(FindAllAdminUsersQuery)
export class FindAllAdminUsersQueryHandler
  implements IQueryHandler<FindAllAdminUsersQuery>
{
  constructor(
    private readonly adminUserAccountService: AdminUserAccountService,
  ) {}

  async execute(): Promise<AdminUser[]> {
    return this.adminUserAccountService.findAllAdminUsers();
  }
}
