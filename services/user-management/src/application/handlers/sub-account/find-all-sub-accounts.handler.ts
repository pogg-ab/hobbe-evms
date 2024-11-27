// src/application/handlers/sub-account/find-all-sub-accounts.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SubAccountService } from 'src/application/services/sub-account.service';
import { SubAccount } from 'src/domain/entities/sub-account.entity';
import { FindAllSubAccountsQuery } from '../../queries/sub-account/find-all-sub-accounts.query';

@QueryHandler(FindAllSubAccountsQuery)
export class FindAllSubAccountsQueryHandler
  implements IQueryHandler<FindAllSubAccountsQuery>
{
  constructor(private readonly subAccountService: SubAccountService) {}

  async execute(query: FindAllSubAccountsQuery): Promise<SubAccount[]> {
    return this.subAccountService.findAll();
  }
}
