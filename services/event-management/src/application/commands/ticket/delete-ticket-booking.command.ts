import { ICommand } from '@nestjs/cqrs';

export class DeleteTicketBookingCommand implements ICommand {
  constructor(public readonly id: string) {}
}
