import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { FavoriteEventCommand } from "src/application/commands/favorite/favorite-event.command";
import { FavoriteEventService } from "src/application/services/favorite/favorite-event.service";

@CommandHandler(FavoriteEventCommand)
export class FavoriteCommandHandler implements ICommandHandler<FavoriteEventCommand> {
    constructor(private readonly favoriteEventService: FavoriteEventService) {}
    async execute(command: FavoriteEventCommand) {
        const { user_id, event_id } = command;
        return this.favoriteEventService.favoriteEvent(user_id, event_id);
    }
}