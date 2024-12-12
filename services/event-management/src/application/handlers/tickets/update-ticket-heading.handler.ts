import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdatedTicketHeadingCommand } from "src/application/commands/ticket/update-ticket-heading.command";
import { TicketsHeadingService } from "src/application/services/tickets/tickets-heading.service";
import { TicketsHeading } from "src/domain/entities/tickets-heading.entity";



@CommandHandler(UpdatedTicketHeadingCommand)

export class UpdatedTicketHeadingCommandHandler implements ICommandHandler<UpdatedTicketHeadingCommand>{
    constructor(
        private readonly ticketsService : TicketsHeadingService
    ){}
    execute(command: UpdatedTicketHeadingCommand): Promise<TicketsHeading> {
        const { id, ticket, user } = command;
        return this.ticketsService.update(id, ticket, user);
    }

    


}