import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ActivateTicketsByHeadingCommand } from "src/application/commands/ticket/activate-tickets-by-heading.command";
import { TicketsHeadingService } from "src/application/services/tickets/tickets-heading.service";
import { TicketsHeading } from "src/domain/entities/tickets-heading.entity";


@CommandHandler(ActivateTicketsByHeadingCommand)

export class ActivateTicketsByHeadingCommandHandler implements ICommandHandler<ActivateTicketsByHeadingCommand> {
    constructor(
        private readonly ticketHeadingService: TicketsHeadingService,  // inject the TicketsService here if needed.
    ){}
    execute(command: ActivateTicketsByHeadingCommand): Promise<TicketsHeading> {
        const { id, status, user} = command;
        return this.ticketHeadingService.activate(id,status,user)
    }
    // Add your implementation here
    
}