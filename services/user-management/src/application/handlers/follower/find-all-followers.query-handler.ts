
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FollowerService } from 'src/application/services/follower.service';
import { Follower } from 'src/domain/entities/follower.entity';
import { FindAllFollowersQuery } from '../../queries/follower/find-all-followers.query';

@QueryHandler(FindAllFollowersQuery)
export class FindAllFollowersQueryHandler
    implements IQueryHandler<FindAllFollowersQuery> {
    constructor(private readonly followerService: FollowerService) { }

    async execute(query: FindAllFollowersQuery): Promise<{
        followers: Follower[] | null;
        total: number;
        page: number;
        limit: number;
    }> {
        const { userId, page, limit, status } = query;
        return this.followerService.findAllFollowersByUserId(userId, page, limit, status);
    }
}

