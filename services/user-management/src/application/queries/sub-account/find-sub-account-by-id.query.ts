import { IQuery } from '@nestjs/cqrs';
import { SubAccountID } from 'src/domain/value-objects/sub-account-id.value-object';

export class FindSubAccountByIdQuery implements IQuery {
  constructor(public readonly id: SubAccountID) {}
}
