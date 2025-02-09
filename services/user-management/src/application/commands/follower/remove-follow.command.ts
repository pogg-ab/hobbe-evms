import { ICommand } from '@nestjs/cqrs';
import { FollowID } from 'src/domain/value-objects/follower-id.value-object';

export class RemoveFollowCommand implements ICommand {
  constructor(public readonly followId: FollowID) { }
}
