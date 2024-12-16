import { IQuery } from '@nestjs/cqrs';

export class FindTicketBookingsByTicketBuyerQuery implements IQuery {
  constructor(public readonly ticketBuyerId: string) {}
}
