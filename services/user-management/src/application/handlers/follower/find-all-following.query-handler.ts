
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FollowerService } from 'src/application/services/follower.service';
import { Follower } from 'src/domain/entities/follower.entity';
import { FindAllFollowingQuery } from 'src/application/queries/follower/find-all-following.query';

@QueryHandler(FindAllFollowingQuery)
export class FindAllFollowingQueryHandler
    implements IQueryHandler<FindAllFollowingQuery> {
    constructor(private readonly followerService: FollowerService) { }

    async execute(query: FindAllFollowingQuery): Promise<{
        following: Follower[] | null;
        total: number;
        page: number;
        limit: number;
    }> {
        const { userId, page, limit } = query;
        return this.followerService.findAllFollowingByUserId(userId, page, limit);
    }
}

