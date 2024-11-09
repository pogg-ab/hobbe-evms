import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PersonalAccountService } from 'src/application/services/personal-account.service';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { FindAllPersonalAccountsQuery } from '../../queries/personal-account/find-all-personal-accounts.query';

@QueryHandler(FindAllPersonalAccountsQuery)
export class FindAllPersonalAccountsQueryHandler
  implements IQueryHandler<FindAllPersonalAccountsQuery>
{
  constructor(
    private readonly personalAccountService: PersonalAccountService,
  ) {}

  async execute(): Promise<PersonalAccount[]> {
    return this.personalAccountService.findAll();
  }
}
