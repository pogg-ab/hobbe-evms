import { IQuery } from '@nestjs/cqrs';

export class FindPersonalAccountByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}
