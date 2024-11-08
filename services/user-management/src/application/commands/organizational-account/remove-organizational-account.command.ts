import { ICommand } from '@nestjs/cqrs';

export class RemoveOrganizationalAccountCommand implements ICommand {
  constructor(public readonly id: number) {}
}
