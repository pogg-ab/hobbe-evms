// src/application/handlers/organizational-account/find-organizational-account-by-id.query-handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { OrganizationalAccountService } from 'src/application/services/organizational-account.service';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { FindOrganizationalAccountByIdQuery } from '../../queries/organizational-account/find-organizational-account-by-id.query';

@QueryHandler(FindOrganizationalAccountByIdQuery)
export class FindOrganizationalAccountByIdQueryHandler
  implements IQueryHandler<FindOrganizationalAccountByIdQuery>
{
  constructor(
    private readonly organizationalAccountService: OrganizationalAccountService,
  ) {}

  async execute(
    query: FindOrganizationalAccountByIdQuery,
  ): Promise<OrganizationalAccount | null> {
    return this.organizationalAccountService.findOne(query.id);
  }
}
