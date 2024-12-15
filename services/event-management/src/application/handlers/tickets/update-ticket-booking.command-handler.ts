import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateTicketBookingCommand } from 'src/application/commands/ticket-booking/update-ticket-booking.command';
import { TicketBookingsService } from 'src/application/services/ticket-bookings/ticket-bookings.service';

@CommandHandler(UpdateTicketBookingCommand)
export class UpdateTicketBookingCommandHandler
  implements ICommandHandler<UpdateTicketBookingCommand>
{
  constructor(private readonly ticketBookingsService: TicketBookingsService) {}

  async execute(command: UpdateTicketBookingCommand): Promise<void> {
    const { booking_id, updateTicketBookingDto } = command;
    return this.ticketBookingsService.update(
      booking_id,
      updateTicketBookingDto,
    );
  }
}
