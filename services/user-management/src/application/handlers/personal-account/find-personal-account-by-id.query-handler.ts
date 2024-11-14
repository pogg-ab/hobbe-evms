import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PersonalAccountService } from 'src/application/services/personal-account.service';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { FindPersonalAccountByIdQuery } from '../../queries/personal-account/find-personal-account-by-id.query';

@QueryHandler(FindPersonalAccountByIdQuery)
export class FindPersonalAccountByIdQueryHandler
  implements IQueryHandler<FindPersonalAccountByIdQuery>
{
  constructor(
    private readonly personalAccountService: PersonalAccountService,
  ) {}

  async execute(
    query: FindPersonalAccountByIdQuery,
  ): Promise<PersonalAccount | null> {
    return this.personalAccountService.findOne(query.id);
  }
}
