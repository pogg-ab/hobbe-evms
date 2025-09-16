import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { TicketService } from 'src/application/services/support/ticket.service';
import { DeleteTicketCommand } from 'src/application/commands/support/delete-ticket.command';

@CommandHandler(DeleteTicketCommand)
export class DeleteTicketCommandHandler implements ICommandHandler<DeleteTicketCommand> {
    constructor(private readonly ticketService: TicketService) { }

    async execute(command: DeleteTicketCommand): Promise<void> {
        const { id } = command;
        await this.ticketService.deleteTicket(id);
    }
}