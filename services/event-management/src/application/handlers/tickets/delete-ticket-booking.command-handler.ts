import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteTicketBookingCommand } from 'src/application/commands/ticket/delete-ticket-booking.command';
import { TicketBookingService } from 'src/application/services/tickets/ticket-booking/ticket-booking.service';

@CommandHandler(DeleteTicketBookingCommand)
export class DeleteTicketBookingCommandHandler
  implements ICommandHandler<DeleteTicketBookingCommand>
{
  constructor(private readonly ticketBookingsService: TicketBookingService) {}

  async execute(command: DeleteTicketBookingCommand): Promise<void> {
    const { id } = command;
    return this.ticketBookingsService.delete(id);
  }
}
