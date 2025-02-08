import { Follower } from '../entities/follower.entity';
import { FollowID } from '../value-objects/follower-id.value-object';

export interface IFollowerRepository {
    create(follower: Follower): Promise<Follower>;
    findAllByUserId(userId: string): Promise<Follower[]>;
    findOne(id: FollowID): Promise<Follower | null>;
    update(id: FollowID, follower: Follower): Promise<Follower>;
    delete(id: FollowID): Promise<void>;
    findStatus(followerId: string, followingId: string): Promise<string | null>;
    findByFollowerAndFollowing(followerId: string, followingId: string): Promise<Follower | null>;
}
