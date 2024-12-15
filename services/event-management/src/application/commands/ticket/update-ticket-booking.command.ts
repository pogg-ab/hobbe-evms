import { ICommand } from '@nestjs/cqrs';
import { UpdateTicketBookingDto } from 'src/presentation/dtos/tickets/update-ticket-booking.dto';

export class UpdateTicketBookingCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly updateTicketBookingDto: UpdateTicketBookingDto,
    public readonly user: any,
  ) {}
}
