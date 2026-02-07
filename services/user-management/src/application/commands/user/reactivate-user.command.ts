import { ICommand } from '@nestjs/cqrs';

export class ReactivateUserCommand implements ICommand {
  constructor(public readonly userId: string) {}
}
