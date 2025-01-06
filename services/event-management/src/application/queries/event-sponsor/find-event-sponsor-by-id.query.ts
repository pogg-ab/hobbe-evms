import { IQuery } from '@nestjs/cqrs';

export class EventSponsorFindById implements IQuery {
  constructor(public readonly id: string) {}
}
