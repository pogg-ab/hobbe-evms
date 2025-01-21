// src/application/handlers/sub-account/find-sub-account-by-id.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SubAccountService } from 'src/application/services/sub-account.service';
import { SubAccount } from 'src/domain/entities/sub-account.entity';
import { FindSubAccountByIdQuery } from '../../queries/sub-account/find-sub-account-by-id.query';

@QueryHandler(FindSubAccountByIdQuery)
export class FindSubAccountByIdQueryHandler
  implements IQueryHandler<FindSubAccountByIdQuery>
{
  constructor(private readonly subAccountService: SubAccountService) {}

  async execute(query: FindSubAccountByIdQuery): Promise<SubAccount | null> {
    return this.subAccountService.findOne(query.id);
  }
}
