import { IQuery } from '@nestjs/cqrs';

export class GetActiveUsersQuery implements IQuery {
  constructor(
    public readonly period: 'daily' | 'weekly' | 'monthly',
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {}
}
