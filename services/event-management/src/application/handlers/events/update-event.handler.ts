import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateEventsCommand } from "src/application/commands/update.event.command";
import { EventsService } from "src/application/services/events/events.service";
import { Events } from "src/domain/entities/events.entity";


@CommandHandler(UpdateEventsCommand)

export class UpdateEventsCommandHandler implements ICommandHandler<UpdateEventsCommand> {
    constructor(private readonly eventService: EventsService) {}
    execute(command: UpdateEventsCommand): Promise<Events> {
        const { id, updateEventsDto } = command;
    return this.eventService.update(id, updateEventsDto);
    }
}