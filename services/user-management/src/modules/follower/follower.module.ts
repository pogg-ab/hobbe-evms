// src/follower/follower.module.ts

import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcceptFollowRequestCommandHandler } from 'src/application/handlers/follower/accept-follow-request.command-handler';
import { BlockCommandHandler } from 'src/application/handlers/follower/block.command-handler';
import { CreateFollowCommandHandler } from 'src/application/handlers/follower/create-follow.command-handler';
import { FindAllFollowersQueryHandler } from 'src/application/handlers/follower/find-all-followers.query-handler';
import { FindFollowStatusQueryHandler } from 'src/application/handlers/follower/find-follow-status.query-handler';
import { FindFollowerByIdQueryHandler } from 'src/application/handlers/follower/find-follower-by-id.query-handler';
import { RemoveFollowCommandHandler } from 'src/application/handlers/follower/remove-follow.command-handler';
import { UnblockCommandHandler } from 'src/application/handlers/follower/unblock.command-handler';
import { UnfollowCommandHandler } from 'src/application/handlers/follower/unfollow.command-handler';
import { FollowerProfile } from 'src/application/mappers/follower.profile';
import { FollowerService } from 'src/application/services/follower.service';
import { Follower } from 'src/domain/entities/follower.entity';
import { User } from 'src/domain/entities/user.entity';
import { FOLLOWER_REPOSITORY_TOKEN } from 'src/domain/repositories/follower.repository.token';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { FollowerRepositoryImpl } from 'src/infrastructure/persistence/repositories/follower.repository.impl';
import { UserRepositoryImpl } from 'src/infrastructure/persistence/repositories/user.repository.impl';
import { FollowerController } from 'src/presentation/controllers/follower.controller';

@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature([Follower, User]),
    CqrsModule,
  ],
  controllers: [FollowerController],
  providers: [
    FollowerService,
    CreateFollowCommandHandler,
    AcceptFollowRequestCommandHandler,
    RemoveFollowCommandHandler,
    UnfollowCommandHandler,
    BlockCommandHandler,
    UnblockCommandHandler,
    FindAllFollowersQueryHandler,
    FindFollowStatusQueryHandler,
    FindFollowerByIdQueryHandler,
    FollowerProfile,
    {
      provide: FOLLOWER_REPOSITORY_TOKEN,
      useClass: FollowerRepositoryImpl,
    },
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepositoryImpl,
    },
  ],

})
export class FollowerModule { }
