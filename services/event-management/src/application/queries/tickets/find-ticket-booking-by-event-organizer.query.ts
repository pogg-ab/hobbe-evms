import { IQuery } from '@nestjs/cqrs';

export class FindTicketBookingsByEventOrganizerQuery implements IQuery {
  constructor(public readonly eventOrganizerId: string) {}
}
