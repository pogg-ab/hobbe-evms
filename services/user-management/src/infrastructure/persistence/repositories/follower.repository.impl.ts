import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follower } from 'src/domain/entities/follower.entity';
import { IFollowerRepository } from 'src/domain/repositories/follower.repository';
import { FollowID } from 'src/domain/value-objects/follower-id.value-object';
import { Repository } from 'typeorm';

@Injectable()
export class FollowerRepositoryImpl implements IFollowerRepository {
    constructor(
        @InjectRepository(Follower)
        private readonly followerRepository: Repository<Follower>,
    ) { }

    async create(follower: Follower): Promise<Follower> {
        try {
            const newFollower = this.followerRepository.create(follower);
            return await this.followerRepository.save(newFollower);
        } catch (error) {
            throw new HttpException(
                `Error creating Follower: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findAllFollowersByUserId(userId: string, page: number, limit: number): Promise<{
        followers: Follower[] | null;
        total: number;
        page: number;
        limit: number;
    }> {
        try {
            const offset = (page - 1) * limit;

            const followers = await this.followerRepository.find({
                where: [
                    { following: { user_id: userId } },
                ],
                relations: ['follower', 'follower.personal_account', 'follower.organizational_account'],
                take: limit,
                skip: offset,

            });
            const total = await this.followerRepository.count({ where: { following: { user_id: userId } }, });

            await Promise.all(followers.map(async (follower) => {

                if (follower.follower) {
                    this.removeSensitiveFields(follower.follower);
                }
            }));
            return {
                followers: followers || null,
                total,
                page,
                limit,
            };
        } catch (error) {
            throw new HttpException(
                `Error fetching Followers for user with ID ${userId}: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
    async findAllFollowingByUserId(userId: string, page: number, limit: number): Promise<{
        following: Follower[] | null;
        total: number;
        page: number;
        limit: number;
    }> {
        try {
            const offset = (page - 1) * limit;

            const following = await this.followerRepository.find({
                where: [
                    { follower: { user_id: userId } },
                ],
                relations: ['following', 'following.personal_account', 'following.organizational_account'],
                take: limit,
                skip: offset,

            });
            const total = await this.followerRepository.count({ where: { follower: { user_id: userId } }, });

            await Promise.all(following.map(async (follower) => {

                if (follower.following) {
                    this.removeSensitiveFields(follower.following);
                }
            }));
            return {
                following: following || null,
                total,
                page,
                limit,
            };
        } catch (error) {
            throw new HttpException(
                `Error fetching Followers for user with ID ${userId}: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
    private removeSensitiveFields(user: any): void {
        const fieldsToRemove = [
            'password',
            'password_reset_token',
            'password_reset_token_expiry',
            'password_reset_requested_at',
            'otp',
            'otp_expiry',
        ];

        fieldsToRemove.forEach(field => {
            delete user[field];
        });
    }

    async findOne(id: FollowID): Promise<Follower | null> {
        try {
            const follower = await this.followerRepository.findOne({
                where: { follow_id: id.toString() },
                relations: ['following', 'following.personal_account', 'following.organizational_account'],
            });


            if (!follower) {
                throw new HttpException(
                    `Follower with ID ${id} not found`,
                    HttpStatus.NOT_FOUND,
                );
            }


            if (follower.following) {
                this.removeSensitiveFields(follower.following);
            }

            return follower;
        } catch (error) {
            throw new HttpException(
                `Error fetching Follower with ID ${id}: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }



    async update(id: FollowID, follower: Follower): Promise<Follower> {
        try {
            const existingFollower = await this.findOne(id);
            if (!existingFollower) {
                throw new HttpException(
                    `Follower with ID ${id} not found`,
                    HttpStatus.NOT_FOUND,
                );
            }

            const updatedFollower = Object.assign(existingFollower, follower);
            return await this.followerRepository.save(updatedFollower);
        } catch (error) {
            throw new HttpException(
                `Error updating Follower: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async delete(id: FollowID): Promise<void> {
        try {
            const followerToDelete = await this.followerRepository.findOne({
                where: { follow_id: id },
            });
            if (!followerToDelete) {
                throw new HttpException(
                    `Follower with ID ${id} not found`,
                    HttpStatus.NOT_FOUND,
                );
            }

            await this.followerRepository.delete(id.toString());
        } catch (error) {
            throw new HttpException(
                `Error deleting Follower: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findStatus(followerId: string, followingId: string): Promise<string | null> {
        try {
            const follower = await this.followerRepository.findOne({
                where: [
                    { follower: { user_id: followerId }, following: { user_id: followingId } },
                    { follower: { user_id: followingId }, following: { user_id: followerId } },
                ],
            });

            if (!follower) {
                return null;
            }

            return follower.status;
        } catch (error) {
            throw new HttpException(
                `Error fetching Follow status: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findByFollowerAndFollowing(followerId: string, followingId: string): Promise<Follower | null> {
        try {
            return await this.followerRepository.findOne({
                where: [
                    { follower: { user_id: followerId }, following: { user_id: followingId } },
                ],
            });
        } catch (error) {
            throw new HttpException(
                `Error finding Follower for followerId ${followerId} and followingId ${followingId}: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
