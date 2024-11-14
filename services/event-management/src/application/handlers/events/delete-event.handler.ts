import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteEventCommand } from "src/application/commands/delete-event.commamd";
import { EventsService } from "src/application/services/events/events.service";

@CommandHandler(DeleteEventCommand)
export class DeleteEventCommandHandler implements ICommandHandler<DeleteEventCommand> {
    constructor(private readonly eventService: EventsService) {}
    async execute(command: DeleteEventCommand): Promise<void> {
        const { id } = command;
        await this.eventService.delete(id);
    }
}