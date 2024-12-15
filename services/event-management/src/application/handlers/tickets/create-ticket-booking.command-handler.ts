import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTicketBookingCommand } from 'src/application/commands/ticket/create-ticket-booking.command';
import { TicketBookingsService } from 'src/application/services/ticket-bookings/ticket-bookings.service';

@CommandHandler(CreateTicketBookingCommand)
export class CreateTicketBookingCommandHandler
  implements ICommandHandler<CreateTicketBookingCommand>
{
  constructor(private readonly ticketBookingsService: TicketBookingsService) {}

  async execute(command: CreateTicketBookingCommand): Promise<void> {
    const { createTicketBookingDto } = command;
    return this.ticketBookingsService.create(createTicketBookingDto);
  }
}
