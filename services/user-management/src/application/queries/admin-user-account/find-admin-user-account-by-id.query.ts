import { IQuery } from '@nestjs/cqrs';

export class FindAdminUserAccountByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}
