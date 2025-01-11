import { IQuery } from '@nestjs/cqrs';

export class FindAllFollowersQuery implements IQuery {
    constructor(
        public readonly userId: string,
    ) { }
}