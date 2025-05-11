import { ICommand } from '@nestjs/cqrs';

export class FindFollowStatusCommand implements ICommand {
  constructor(
    public readonly followerId: string,
    public readonly followingId: string,
  ) {}
}