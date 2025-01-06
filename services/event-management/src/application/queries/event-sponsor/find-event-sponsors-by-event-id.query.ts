import { IQuery } from '@nestjs/cqrs';

export class FindEventSponsorsByEventIdQuery implements IQuery {
  constructor(public readonly eventId: string) {}
}
