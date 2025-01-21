import { IQuery } from '@nestjs/cqrs';

export class FindFollowStatusQuery implements IQuery {
    constructor(
        public readonly followerId: string,
        public readonly followingId: string,
    ) { }
}