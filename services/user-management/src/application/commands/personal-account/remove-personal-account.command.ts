import { ICommand } from '@nestjs/cqrs';

export class RemovePersonalAccountCommand implements ICommand {
  constructor(public readonly id: string) {}
}
