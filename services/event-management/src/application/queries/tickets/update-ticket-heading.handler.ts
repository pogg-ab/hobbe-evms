import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdatedTicketHeadingCommand } from "src/application/commands/ticket/update-ticket-heading.command";
import { TicketsService } from "src/application/services/tickets/tickets.service";
import { Tickets } from "src/domain/entities/tickets.entity";



@CommandHandler(UpdatedTicketHeadingCommand)

export class UpdatedTicketHeadingCommandHandler implements ICommandHandler<UpdatedTicketHeadingCommand>{
    constructor(
        private readonly ticketsService : TicketsService
    ){}
    execute(command: UpdatedTicketHeadingCommand): Promise<Tickets> {
        const { id, ticket, user } = command;
        return this.ticketsService.update(id, ticket, user);
    }

    


}