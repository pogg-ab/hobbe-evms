import { IQuery } from '@nestjs/cqrs';
import { FollowStatus } from 'src/domain/value-objects/follow-status.value-object';

export class FindAllFollowersQuery implements IQuery {
    constructor(
        public readonly userId: string,
        public readonly page: number,
        public readonly limit: number,
        public readonly status: FollowStatus,
    ) { }
}