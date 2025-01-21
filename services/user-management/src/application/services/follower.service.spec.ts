// src/application/services/follower.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { FollowerService } from './follower.service';
import { Follower } from 'src/domain/entities/follower.entity';
import { IFollowerRepository } from 'src/domain/repositories/follower.repository';
import { FOLLOWER_REPOSITORY_TOKEN } from 'src/domain/repositories/follower.repository.token';
import { NotFoundException } from '@nestjs/common';

describe('FollowerService', () => {
    let service: FollowerService;
    let followerRepository: IFollowerRepository;

    beforeEach(async () => {
        const mockFollowerRepository = {
            create: jest.fn().mockResolvedValue({} as Follower),
            findAllByUserId: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({} as Follower),
            update: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined),
            findStatus: jest.fn().mockResolvedValue('PENDING'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FollowerService,
                {
                    provide: FOLLOWER_REPOSITORY_TOKEN,
                    useValue: mockFollowerRepository,
                },
            ],
        }).compile();

        service = module.get<FollowerService>(FollowerService);
        followerRepository = module.get<IFollowerRepository>(FOLLOWER_REPOSITORY_TOKEN);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new follower', async () => {
            const result = await service.create({ userId: 'user1', followingId: 'user2' } as any);
            expect(result).toBeDefined();
            expect(followerRepository.create).toHaveBeenCalled();
        });
    });

    describe('findAllFollowers', () => {
        it('should return all followers for a user', async () => {
            const result = await service.findAllFollowers('user1');
            expect(result).toEqual([]);
            expect(followerRepository.findAllByUserId).toHaveBeenCalledWith('user1');
        });
    });

    describe('findOne', () => {
        it('should return a follower', async () => {
            const result = await service.findOne('some-follower-id' as any);
            expect(result).toBeDefined();
            expect(followerRepository.findOne).toHaveBeenCalled();
        });

        it('should throw NotFoundException if follower is not found', async () => {
            jest.spyOn(followerRepository, 'findOne').mockResolvedValueOnce(null);
            await expect(service.findOne('non-existing-id' as any)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('update', () => {
        it('should update a follower', async () => {
            const result = await service.update('some-follower-id' as any, {} as any);
            expect(result).toBeDefined();
            expect(followerRepository.update).toHaveBeenCalled();
        });
    });

    describe('deleteFollower', () => {
        it('should delete a follower', async () => {
            await service.deleteFollower('some-follower-id' as any);
            expect(followerRepository.delete).toHaveBeenCalledWith('some-follower-id');
        });
    });

    describe('findFollowStatus', () => {
        it('should return the follow status', async () => {
            const result = await service.findFollowStatus('user1', 'user2');
            expect(result).toBe('PENDING');
            expect(followerRepository.findStatus).toHaveBeenCalledWith('user1', 'user2');
        });

        it('should throw NotFoundException if follow status is not found', async () => {
            jest.spyOn(followerRepository, 'findStatus').mockResolvedValueOnce(null);
            await expect(service.findFollowStatus('user1', 'user2')).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
