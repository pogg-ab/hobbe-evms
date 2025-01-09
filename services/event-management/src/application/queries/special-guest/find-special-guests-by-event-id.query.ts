import { IQuery } from '@nestjs/cqrs';

export class FindSpecialGuestsByEventIdQuery implements IQuery {
  constructor(public readonly eventId: string) {}
}
