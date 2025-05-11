import { IQuery } from '@nestjs/cqrs';

export class FindAllUsersQuery implements IQuery {
    constructor(
        public readonly page: number,
        public readonly limit: number
    ) {
    }
}
