import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateEventCommand } from "../../commands/create-event.command";
import { Events } from "src/domain/entities/events.entity";
import { EventsService } from "../../services/events/events.service";

@CommandHandler(CreateEventCommand)
export class CreateEventCommandHandler implements ICommandHandler<CreateEventCommand>{
    constructor(private readonly eventService: EventsService) {}
   async execute(command: CreateEventCommand): Promise<Events> {
       const { createEventsDto } = command;
       return this.eventService.create(createEventsDto);
    }
}