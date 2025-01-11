import { ICommand } from '@nestjs/cqrs';

export class RemoveFollowCommand implements ICommand {
  constructor(public readonly followId: string) {}
}
