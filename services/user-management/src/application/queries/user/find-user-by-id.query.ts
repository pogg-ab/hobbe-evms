import { IQuery } from '@nestjs/cqrs';

export class FindUserByIdQuery implements IQuery {
    constructor(
        public readonly userId: string,
    ) { }
}
