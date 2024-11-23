import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AdminUserAccountService } from 'src/application/services/admin-user-account.service';
import { AdminUserAccount } from 'src/domain/entities/admin-user-account.entity';
import { FindAdminUserAccountByIdQuery } from '../../queries/admin-user-account/find-admin-user-account-by-id.query';

@QueryHandler(FindAdminUserAccountByIdQuery)
export class FindAdminUserAccountByIdQueryHandler
  implements IQueryHandler<FindAdminUserAccountByIdQuery>
{
  constructor(
    private readonly adminUserAccountService: AdminUserAccountService,
  ) {}

  async execute(
    query: FindAdminUserAccountByIdQuery,
  ): Promise<AdminUserAccount | null> {
    return this.adminUserAccountService.findOne(query.id);
  }
}
