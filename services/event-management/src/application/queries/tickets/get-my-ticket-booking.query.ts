import { IQuery } from '@nestjs/cqrs';

export class GetMyTicketBookingQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
