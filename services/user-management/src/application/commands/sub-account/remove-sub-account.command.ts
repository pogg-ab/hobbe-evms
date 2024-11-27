import { ICommand } from '@nestjs/cqrs';
import { SubAccountID } from 'src/domain/value-objects/sub-account-id.value-object';

export class RemoveSubAccountCommand implements ICommand {
  constructor(public readonly id: SubAccountID) {}
}
