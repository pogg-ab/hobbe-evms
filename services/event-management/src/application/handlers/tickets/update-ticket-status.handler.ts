// src/application/handlers/ticket/update-ticket-status.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateTicketStatusCommand } from 'src/application/commands/ticket/update-ticket-status.command';
import { TicketBookingService } from 'src/application/services/tickets/ticket-booking/ticket-booking.service';
import { Tickets } from 'src/domain/entities/tickets.entity';

@CommandHandler(UpdateTicketStatusCommand)
export class UpdateTicketStatusHandler
  implements ICommandHandler<UpdateTicketStatusCommand> {
  constructor(private readonly ticketBookingService: TicketBookingService) { }

  async execute(command: UpdateTicketStatusCommand): Promise<Tickets> {
    const { ticketId, scannedBy } = command;

    return this.ticketBookingService.markTicketAsAttended(ticketId, scannedBy);
  }
}
