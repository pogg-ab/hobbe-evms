import { ICommand } from '@nestjs/cqrs';

export class AcceptFollowRequestCommand implements ICommand {
  constructor(
    public readonly followerId: string,
    public readonly followingId: string,
  ) {}
}