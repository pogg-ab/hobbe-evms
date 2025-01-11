// src/follower/follower.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { FollowerController } from './follower.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateFollowCommand } from 'src/application/commands/follower/create-follow.command';
import { AcceptFollowRequestCommand } from 'src/application/commands/follower/accept-follow-request.command';
import { RemoveFollowCommand } from 'src/application/commands/follower/remove-follow.command';
import { FindAllFollowersQuery } from 'src/application/queries/follower/find-all-followers.query';
import { FindFollowStatusQuery } from 'src/application/queries/follower/find-follow-status.query';
import { Follower } from 'src/domain/entities/follower.entity';

describe('FollowerController', () => {
  let controller: FollowerController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowerController],
      providers: [
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FollowerController>(FollowerController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a follow request', async () => {
    const createFollowDto = { followerId: 'user1', followingId: 'user2' };
    const followResult: Follower = {
      follower: 'user1',
      followingId: 'user2',
      isMutual: false,
    };

    jest.spyOn(commandBus, 'execute').mockResolvedValue(followResult);

    const result = await controller.create(createFollowDto);

    expect(result.message).toBe('Follow request created successfully');
    expect(result.follow).toEqual(followResult);
    expect(commandBus.execute).toHaveBeenCalledWith(new CreateFollowCommand(createFollowDto));
  });

  it('should accept a follow request', async () => {
    const followerId = 'user1';
    const followingId = 'user2';
    const acceptedFollow: Follower = {
      followerId: 'user1',
      followingId: 'user2',
      isMutual: true,
    };

    jest.spyOn(commandBus, 'execute').mockResolvedValue(acceptedFollow);

    const result = await controller.acceptFollowRequest(followerId, followingId);

    expect(result).toEqual(acceptedFollow);
    expect(commandBus.execute).toHaveBeenCalledWith(new AcceptFollowRequestCommand(followerId, followingId));
  });

  it('should get follow status', async () => {
    const followerId = 'user1';
    const followingId = 'user2';
    const followStatus = { status: 'ACCEPTED' };

    jest.spyOn(queryBus, 'execute').mockResolvedValue(followStatus);

    const result = await controller.findFollowStatus(followerId, followingId);

    expect(result).toEqual(followStatus);
    expect(queryBus.execute).toHaveBeenCalledWith(new FindFollowStatusQuery(followerId, followingId));
  });

  it('should get all followers', async () => {
    const followers: Follower[] = [
      { followerId: 'user1', followingId: 'user2', isMutual: true },
      { followerId: 'user3', followingId: 'user4', isMutual: false },
    ];

    jest.spyOn(queryBus, 'execute').mockResolvedValue(followers);

    const result = await controller.findAllFollowers();

    expect(result).toEqual(followers);
    expect(queryBus.execute).toHaveBeenCalledWith(new FindAllFollowersQuery());
  });

  it('should remove a follow relationship', async () => {
    const followId = 'some-follow-id';

    jest.spyOn(commandBus, 'execute').mockResolvedValue(undefined);

    await controller.removeFollow(followId);

    expect(commandBus.execute).toHaveBeenCalledWith(new RemoveFollowCommand(followId));
  });
});
