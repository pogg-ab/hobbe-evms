import { IQuery } from '@nestjs/cqrs';

export class FindOrganizationalAccountByIdQuery implements IQuery {
  constructor(public readonly id: number) {}
}
