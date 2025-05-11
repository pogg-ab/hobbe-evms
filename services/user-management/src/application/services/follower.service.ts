// src/application/services/follower.service.ts

import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follower } from 'src/domain/entities/follower.entity';
import { User } from 'src/domain/entities/user.entity';
import { IFollowerRepository } from 'src/domain/repositories/follower.repository';
import { FOLLOWER_REPOSITORY_TOKEN } from 'src/domain/repositories/follower.repository.token';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { FollowStatus } from 'src/domain/value-objects/follow-status.value-object';
import { FollowID } from 'src/domain/value-objects/follower-id.value-object';
import { CreateFollowDto } from 'src/presentation/dtos/create-follow.dto';
import { UpdateFollowDto } from 'src/presentation/dtos/update-follow.dto';
import { Repository } from 'typeorm';

@Injectable()
export class FollowerService {
    constructor(
        @Inject(FOLLOWER_REPOSITORY_TOKEN)
        private readonly followerRepository: IFollowerRepository,
        @Inject(USER_REPOSITORY_TOKEN)
        private readonly userRepository: IUserRepository,
        @InjectMapper() private readonly mapper: Mapper,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) { }

    async create(createFollowDto: CreateFollowDto): Promise<Follower> {
        const followerExists = await this.userRepository.findById(createFollowDto.follower_user_id.toString());
        if (!followerExists) {
            throw new NotFoundException(`Follower user with ID ${createFollowDto.follower_user_id} does not exist`);
        }

        const followingExists = await this.userRepository.findById(createFollowDto.following_user_id.toString());
        if (!followingExists) {
            throw new NotFoundException(`Following user with ID ${createFollowDto.following_user_id} does not exist`);
        }

        if (createFollowDto.follower_user_id === createFollowDto.following_user_id) {
            throw new BadRequestException('Follower and following user cannot be the same');
        }

        const existingFollow = await this.followerRepository.findByFollowerAndFollowing(createFollowDto.follower_user_id, createFollowDto.following_user_id);

        if (existingFollow) {
            throw new ConflictException('Follow relationship already exists between these users');
        }
        const newFollower = await this.mapper.map(
            createFollowDto,
            CreateFollowDto,
            Follower,
        );
        newFollower.follower = await this.getUser(createFollowDto.follower_user_id)
        newFollower.following = await this.getUser(createFollowDto.following_user_id)


        const savedFollower = await this.followerRepository.create(newFollower);
        return savedFollower;
    }

    private async getUser(userId: string) {
        if (userId) {
            const user = await this.userRepo.findOne({ where: { user_id: userId } });
            return user;
        }
        return null;
    }

    async acceptFollowRequest(followerId: string, followingId: string): Promise<Follower> {
        const follower = await this.followerRepository.findByFollowerAndFollowing(followerId, followingId);

        if (!follower) {
            throw new NotFoundException('Follow request not found');
        }

        follower.status = FollowStatus.ACCEPTED;
        await this.followerRepository.update(follower.follow_id, follower);

        return follower;
    }

    async findAllFollowersByUserId(
        userId: string,
        page: number,
        limit: number,
        status: FollowStatus,
    ): Promise<{
        followers: Follower[] | null;
        total: number;
        page: number;
        limit: number;
    }> {
        return this.followerRepository.findAllFollowersByUserId(userId, page, limit, status);

    }

    async findAllFollowingByUserId(
        userId: string,
        page: number,
        limit: number,
        status: FollowStatus,
    ): Promise<{
        following: Follower[] | null;
        total: number;
        page: number;
        limit: number;
    }> {
        return this.followerRepository.findAllFollowingByUserId(userId, page, limit, status);

    }

    async findOne(id: FollowID): Promise<Follower> {
        const follower = await this.followerRepository.findOne(id);
        if (!follower) {
            throw new NotFoundException(`Follower with ID ${id} not found`);
        }
        return follower;
    }

    async update(
        id: FollowID,
        updateFollowDto: UpdateFollowDto,
    ): Promise<Follower> {
        const follower = await this.findOne(id);
        const updatedFollower = this.mapper.map(
            updateFollowDto,
            UpdateFollowDto,
            Follower,
        );
        await this.followerRepository.update(id, updatedFollower);
        return updatedFollower;
    }
    async deleteFollower(followId: FollowID): Promise<void> {
        const follow = await this.followerRepository.findOne(followId);

        if (!follow) {
            throw new NotFoundException('Follow record not found');
        }

        await this.followerRepository.delete(followId);
    }

    async unfollow(followerId: string, followingId: string): Promise<void> {
        const follow = await this.followerRepository.findByFollowerAndFollowing(followerId, followingId);

        if (!follow) {
            throw new NotFoundException('Follow relationship not found');
        }

        await this.followerRepository.delete(follow.follow_id);
    }

    async findFollowStatus(
        followerId: string,
        followingId: string,
    ): Promise<string> {
        const followStatus = await this.followerRepository.findStatus(
            followerId,
            followingId,
        );
        if (!followStatus) {
            throw new NotFoundException('Follow status not found');
        }
        return followStatus;
    }

    async block(followerId: string, followingId: string): Promise<Follower> {
        const follow = await this.followerRepository.findByFollowerAndFollowing(followerId, followingId);

        if (!follow) {
            throw new NotFoundException('Follow relationship not found');
        }

        if (follow.blocked_by) {
            throw new ConflictException('User is already blocked');
        }

        follow.blocked_by = followerId;
        follow.blocked_at = new Date();

        return this.followerRepository.update(follow.follow_id, follow);
    }

    async unblock(followerId: string, followingId: string): Promise<Follower> {
        const follow = await this.followerRepository.findByFollowerAndFollowing(followerId, followingId);

        if (!follow) {
            throw new NotFoundException('Follow relationship not found');
        }

        if (!follow.blocked_by) {
            throw new BadRequestException('User is not blocked');
        }

        follow.blocked_by = null;
        follow.blocked_at = null;

        return this.followerRepository.update(follow.follow_id, follow);
    }
}
