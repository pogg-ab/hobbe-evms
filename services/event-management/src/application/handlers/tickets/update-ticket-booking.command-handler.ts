import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateTicketBookingCommand } from 'src/application/commands/ticket/update-ticket-booking.command';
import { TicketBookingService } from 'src/application/services/tickets/ticket-booking/ticket-booking.service';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';

@CommandHandler(UpdateTicketBookingCommand)
export class UpdateTicketBookingCommandHandler
  implements ICommandHandler<UpdateTicketBookingCommand>
{
  constructor(private readonly ticketBookingsService: TicketBookingService) {}

  async execute(command: UpdateTicketBookingCommand): Promise<TicketBooking> {
    const { id, updateTicketBookingDto, user } = command;
    return this.ticketBookingsService.update(id, updateTicketBookingDto, user);
  }
}
