import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTicketBookingCommand } from 'src/application/commands/ticket/create-ticket-booking.command';
import { TicketBookingService } from 'src/application/services/tickets/ticket-booking/ticket-booking.service';

@CommandHandler(CreateTicketBookingCommand)
export class CreateTicketBookingCommandHandler
  implements ICommandHandler<CreateTicketBookingCommand>
{
  constructor(private readonly ticketBookingsService: TicketBookingService) {}

  async execute(command: CreateTicketBookingCommand): Promise<void> {
    const { createTicketBookingDto } = command;
    return this.ticketBookingsService.create(createTicketBookingDto);
  }
}
