import { IQuery } from '@nestjs/cqrs';

export class SpecialGuestFindById implements IQuery {
  constructor(public readonly id: string) {}
}
