import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { FollowerService } from 'src/application/services/follower.service';
import { UnblockCommand } from 'src/application/commands/follower/unblock.command';
import { Follower } from 'src/domain/entities/follower.entity';

@CommandHandler(UnblockCommand)
export class UnblockCommandHandler implements ICommandHandler<UnblockCommand> {
    constructor(private readonly followerService: FollowerService) { }

    async execute(command: UnblockCommand): Promise<Follower> {
        const { followerId, followingId } = command;
        return this.followerService.unblock(followerId, followingId);
    }
}
