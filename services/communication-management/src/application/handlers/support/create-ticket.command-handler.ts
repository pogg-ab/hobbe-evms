import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { TicketService } from 'src/application/services/support/ticket.service';
import { CreateTicketCommand } from 'src/application/commands/support/create-ticket.command';
import { TicketResponseDto } from 'src/presentation/dto/support/ticket/ticket.dto';
import { CreateTicketDto } from 'src/presentation/dto/support/ticket/ticket.dto';

@CommandHandler(CreateTicketCommand)
export class CreateTicketCommandHandler
  implements ICommandHandler<CreateTicketCommand>
{
  constructor(private readonly ticketService: TicketService) {}

  async execute(command: CreateTicketCommand): Promise<TicketResponseDto> {
    const {
      subject,
      description,
      email,
      priority,
      status,
      attachments,
      user_id,
    } = command;
    const createTicketDto: CreateTicketDto = {
      subject,
      description,
      email,
      priority,
      status,
      attachments,
      user_id,
    };
    return this.ticketService.createTicket(createTicketDto);
  }
}
