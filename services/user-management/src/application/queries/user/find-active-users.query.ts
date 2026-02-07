import { IQuery } from '@nestjs/cqrs';

export class FindActiveUsersQuery implements IQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
