import { ICommand } from '@nestjs/cqrs';
import { PersonalAccountID } from 'src/domain/value-objects/personal-account-id.value-object';

export class RemovePersonalAccountCommand implements ICommand {
  constructor(public readonly id: PersonalAccountID) {}
}
