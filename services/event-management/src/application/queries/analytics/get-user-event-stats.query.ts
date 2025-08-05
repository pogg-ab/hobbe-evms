import { IQuery } from '@nestjs/cqrs';

export class GetUserEventStatsQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
