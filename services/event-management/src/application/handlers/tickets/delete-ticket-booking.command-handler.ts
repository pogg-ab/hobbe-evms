import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteTicketBookingCommand } from 'src/application/commands/ticket-booking/delete-ticket-booking.command';
import { TicketBookingsService } from 'src/application/services/ticket-bookings/ticket-bookings.service';

@CommandHandler(DeleteTicketBookingCommand)
export class DeleteTicketBookingCommandHandler
  implements ICommandHandler<DeleteTicketBookingCommand>
{
  constructor(private readonly ticketBookingsService: TicketBookingsService) {}

  async execute(command: DeleteTicketBookingCommand): Promise<void> {
    const { booking_id } = command;
    return this.ticketBookingsService.delete(booking_id);
  }
}
