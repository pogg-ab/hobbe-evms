import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateTicketsCommand } from "src/application/commands/ticket/create-tickets.command";
import { TicketsService } from "src/application/services/tickets/tickets.service";
import { Tickets } from "src/domain/entities/tickets.entity";


@CommandHandler(CreateTicketsCommand)

export class CreateTicketsCommandHandler implements ICommandHandler<CreateTicketsCommand> {
    constructor(
        private readonly ticketsService: TicketsService,  // inject the TicketsService here if needed.
    ){}
    execute(command: CreateTicketsCommand): Promise<Tickets> {
        const {event_id,createTicketsDto} = command;

        return  this.ticketsService.create(event_id,createTicketsDto);// return the created ticket
    }

}