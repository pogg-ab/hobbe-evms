// src/application/handlers/organizational-account/find-all-organizational-accounts.query-handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { OrganizationalAccountService } from 'src/application/services/organizational-account.service';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { FindAllOrganizationalAccountsQuery } from '../../queries/organizational-account/find-all-organizational-accounts.query';

@QueryHandler(FindAllOrganizationalAccountsQuery)
export class FindAllOrganizationalAccountsQueryHandler
  implements IQueryHandler<FindAllOrganizationalAccountsQuery>
{
  constructor(
    private readonly organizationalAccountService: OrganizationalAccountService,
  ) {}

  async execute(): Promise<OrganizationalAccount[]> {
    return this.organizationalAccountService.findAll();
  }
}
