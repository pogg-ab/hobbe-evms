import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { FollowerService } from 'src/application/services/follower.service';
import { AcceptFollowRequestCommand } from 'src/application/commands/follower/accept-follow-request.command';
import { Follower } from 'src/domain/entities/follower.entity';

@CommandHandler(AcceptFollowRequestCommand)
export class AcceptFollowRequestCommandHandler
    implements ICommandHandler<AcceptFollowRequestCommand> {
    constructor(private readonly followerService: FollowerService) { }

    async execute(command: AcceptFollowRequestCommand): Promise<Follower | null> {
        const { followerId, followingId } = command;
        return this.followerService.acceptFollowRequest(followerId, followingId);
    }
}
