import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FollowerService } from 'src/application/services/follower.service';
import { FindFollowStatusQuery } from '../../queries/follower/find-follow-status.query';

@QueryHandler(FindFollowStatusQuery)
export class FindFollowStatusQueryHandler
    implements IQueryHandler<FindFollowStatusQuery> {
    constructor(private readonly followerService: FollowerService) { }

    async execute(query: FindFollowStatusQuery): Promise<string> {
        return this.followerService.findFollowStatus(
            query.followerId,
            query.followingId,
        );
    }
}
