import { IQuery } from '@nestjs/cqrs';

export class FindTicketBookingByEventQuery implements IQuery {
  constructor(public readonly event_id: string) {}
}
