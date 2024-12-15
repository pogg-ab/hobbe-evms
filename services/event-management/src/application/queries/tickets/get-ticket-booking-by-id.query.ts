import { IQuery } from '@nestjs/cqrs';

export class GetTicketBookingByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}
