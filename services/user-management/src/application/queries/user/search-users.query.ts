import { IQuery } from '@nestjs/cqrs';

export class SearchUsersQuery implements IQuery {
    constructor(public readonly searchTerm: string) { }
}