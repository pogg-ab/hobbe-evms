import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdatedTicketHeadingCommand } from "src/application/commands/ticket/update-ticket-heading.command";
import { TicketsHeadingService } from "src/application/services/tickets/tickets-heading.service";
import { TicketsHeading } from "src/domain/entities/tickets-heading.entity";



@CommandHandler(UpdatedTicketHeadingCommand)

export class UpdatedTicketHeadingCommandHandler implements ICommandHandler<UpdatedTicketHeadingCommand>{
    constructor(
        private readonly ticketsHeadingService : TicketsHeadingService
    ){}
    execute(command: UpdatedTicketHeadingCommand): Promise<TicketsHeading> {
        const { id, ticket, user } = command;
        return this.ticketsHeadingService.update(id, ticket, user);
    }

    


}