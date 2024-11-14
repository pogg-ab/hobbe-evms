import { IQuery } from '@nestjs/cqrs';
import { PersonalAccountID } from 'src/domain/value-objects/personal-account-id.value-object';

export class FindPersonalAccountByIdQuery implements IQuery {
  constructor(public readonly id: PersonalAccountID) {}
}
