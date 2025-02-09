
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FollowerService } from 'src/application/services/follower.service';
import { Follower } from 'src/domain/entities/follower.entity';
import { FindFollowerByIdQuery } from '../../queries/follower/find-follower-by-id.query';

@QueryHandler(FindFollowerByIdQuery)
export class FindFollowerByIdQueryHandler
    implements IQueryHandler<FindFollowerByIdQuery> {
    constructor(private readonly followerService: FollowerService) { }

    async execute(query: FindFollowerByIdQuery): Promise<Follower | null> {
        return this.followerService.findOne(query.followId);
    }
}
