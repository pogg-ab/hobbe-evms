import { ICommand } from '@nestjs/cqrs';

export class UpdateTicketStatusCommand implements ICommand {
  constructor(
    public readonly ticketNumber: string,
    public readonly scannedBy: string,
  ) { }
}
