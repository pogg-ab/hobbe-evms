import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { FollowerService } from 'src/application/services/follower.service';
import { BlockCommand } from 'src/application/commands/follower/block.command';
import { Follower } from 'src/domain/entities/follower.entity';

@CommandHandler(BlockCommand)
export class BlockCommandHandler implements ICommandHandler<BlockCommand> {
    constructor(private readonly followerService: FollowerService) { }

    async execute(command: BlockCommand): Promise<Follower> {
        const { followerId, followingId } = command;
        return this.followerService.block(followerId, followingId);
    }
}
