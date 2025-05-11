import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { FollowerService } from 'src/application/services/follower.service';
import { RemoveFollowCommand } from 'src/application/commands/follower/remove-follow.command';

@CommandHandler(RemoveFollowCommand)
export class RemoveFollowCommandHandler
    implements ICommandHandler<RemoveFollowCommand> {
    constructor(private readonly followerService: FollowerService) { }

    async execute(command: RemoveFollowCommand): Promise<void> {
        const { followId } = command;
        return this.followerService.deleteFollower(followId);
    }
}
