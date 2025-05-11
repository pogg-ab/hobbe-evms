import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { FollowerService } from 'src/application/services/follower.service';
import { UnfollowCommand } from 'src/application/commands/follower/unfollow.command';

@CommandHandler(UnfollowCommand)
export class UnfollowCommandHandler implements ICommandHandler<UnfollowCommand> {
    constructor(private readonly followerService: FollowerService) { }

    async execute(command: UnfollowCommand): Promise<void> {
        const { followerId, followingId } = command;
        return this.followerService.unfollow(followerId, followingId);
    }
}
