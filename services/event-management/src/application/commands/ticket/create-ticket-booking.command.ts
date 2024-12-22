import { ICommand } from '@nestjs/cqrs';
import { CreateTicketBookingDto } from 'src/presentation/dtos/tickets/create-ticket-booking.dto';

export class CreateTicketBookingCommand implements ICommand {
  constructor(
    public readonly createTicketBookingDto: CreateTicketBookingDto,
    public readonly user: any,
  ) {}
}
