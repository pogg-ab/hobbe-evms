import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { TicketService } from 'src/application/services/freshdesk/ticket.service';
import { UpdateTicketCommand } from 'src/application/commands/freshdesk/update-ticket.command';
import { TicketResponseDto } from 'src/presentation/dto/freshdesk/ticket/ticket.dto';
import { UpdateTicketDto } from 'src/presentation/dto/freshdesk/ticket/ticket.dto';

@CommandHandler(UpdateTicketCommand)
export class UpdateTicketCommandHandler implements ICommandHandler<UpdateTicketCommand> {
    constructor(private readonly ticketService: TicketService) { }

    async execute(command: UpdateTicketCommand): Promise<TicketResponseDto> {
        const { id, subject, description, email, priority, status } = command;
        const updateTicketDto: UpdateTicketDto = { subject, description, email, priority, status };
        return this.ticketService.updateTicket(id, updateTicketDto);
    }
}