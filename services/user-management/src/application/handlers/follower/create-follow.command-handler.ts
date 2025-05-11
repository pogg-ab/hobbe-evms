import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { FollowerService } from 'src/application/services/follower.service';
import { CreateFollowCommand } from 'src/application/commands/follower/create-follow.command';
import { Follower } from 'src/domain/entities/follower.entity';

@CommandHandler(CreateFollowCommand)
export class CreateFollowCommandHandler
    implements ICommandHandler<CreateFollowCommand> {
    constructor(private readonly followerService: FollowerService) { }

    async execute(command: CreateFollowCommand): Promise<Follower> {
        const { createFollowDto } = command;
        return this.followerService.create(createFollowDto);
    }
}
