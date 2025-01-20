import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LikeEventCommand } from "src/application/commands/like/like-event.command";
import { LikeEventService } from "src/application/services/like/like-event.service";

@CommandHandler(LikeEventCommand)
export class LikeEventCommandHandler implements ICommandHandler<LikeEventCommand> {
    constructor(private readonly likeEventService: LikeEventService) {}
    async execute(command: LikeEventCommand) {
        const { user_id, event_id } = command;
        return this.likeEventService.likeEvent(user_id, event_id);
    }
}