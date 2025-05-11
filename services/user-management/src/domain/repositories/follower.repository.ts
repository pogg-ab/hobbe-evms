import { Follower } from '../entities/follower.entity';
import { FollowStatus } from '../value-objects/follow-status.value-object';
import { FollowID } from '../value-objects/follower-id.value-object';

export interface IFollowerRepository {
    create(follower: Follower): Promise<Follower>;
    findAllFollowersByUserId(userId: string, page: number, limit: number, status: string): Promise<{
        followers: Follower[] | null;
        total: number;
        page: number;
        limit: number;
    }>;
    findAllFollowingByUserId(userId: string, page: number, limit: number, status: FollowStatus): Promise<{
        following: Follower[] | null;
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: FollowID): Promise<Follower | null>;
    update(id: FollowID, follower: Follower): Promise<Follower>;
    delete(id: FollowID): Promise<void>;
    findStatus(followerId: string, followingId: string): Promise<string | null>;
    findByFollowerAndFollowing(followerId: string, followingId: string): Promise<Follower | null>;
}
