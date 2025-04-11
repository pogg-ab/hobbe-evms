import { ICommand } from '@nestjs/cqrs';

export class UpdateTicketStatusCommand implements ICommand {
  constructor(
    public readonly ticketId: string,
    public readonly scannedBy: string,
  ) { }
}
