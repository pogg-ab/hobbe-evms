import { ICommand } from '@nestjs/cqrs';

export class SuspendUserCommand implements ICommand {
  constructor(public readonly userId: string) {}
}
