import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AdminUserAccountService } from 'src/application/services/admin-user-account.service';
import { AdminUserAccount } from 'src/domain/entities/admin-user-account.entity';
import { FindAllAdminUserAccountsQuery } from '../../queries/admin-user-account/find-all-admin-user-accounts.query';

@QueryHandler(FindAllAdminUserAccountsQuery)
export class FindAllAdminUserAccountsQueryHandler
  implements IQueryHandler<FindAllAdminUserAccountsQuery>
{
  constructor(
    private readonly adminUserAccountService: AdminUserAccountService,
  ) {}

  async execute(): Promise<AdminUserAccount[]> {
    return this.adminUserAccountService.findAll();
  }
}
