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

    async findAllByUserId(userId: string): Promise<Follower[]> {
        try {
            return await this.followerRepository.find({
                where: [
                    { following: { user_id: userId } },
                    { follower: { user_id: userId } },
                ],
            });
        } catch (error) {
            throw new HttpException(
                `Error fetching Followers for user with ID ${userId}: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findOne(id: FollowID): Promise<Follower | null> {
        try {
            const follower = await this.followerRepository.findOne({
                where: { follow_id: id },
                relations: ['follower', 'following'],
            });
            if (!follower) {
                throw new HttpException(
                    `Follower with ID ${id} not found`,
                    HttpStatus.NOT_FOUND,
                );
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

    async delete(id: string): Promise<void> {
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

            await this.followerRepository.delete(id);
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
                    { follower: { user_id: followingId }, following: { user_id: followerId } },
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
