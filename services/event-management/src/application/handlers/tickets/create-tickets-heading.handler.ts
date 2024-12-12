import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateTicketsHeadingCommand } from "src/application/commands/ticket/create-tickets-heading.command";
import { TicketsHeadingService } from "src/application/services/tickets/tickets-heading.service";
import { TicketsHeading } from "src/domain/entities/tickets-heading.entity";


@CommandHandler(CreateTicketsHeadingCommand)

export class CreateTicketsHeadingCommandHandler implements ICommandHandler<CreateTicketsHeadingCommand> {
    constructor(
        private readonly ticketsService: TicketsHeadingService,  // inject the TicketsService here if needed.
    ){}
    execute(command: CreateTicketsHeadingCommand): Promise<TicketsHeading> {
        const {event_id,createTicketsHeadingDto} = command;

        return  this.ticketsService.create(event_id,createTicketsHeadingDto);// return the created ticket
    }

}