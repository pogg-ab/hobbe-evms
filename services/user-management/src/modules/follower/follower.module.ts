// src/follower/follower.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowerService } from './follower.service';
import { FollowerController } from './follower.controller';
import { Follower } from 'src/domain/entities/follower.entity';
import { User } from 'src/domain/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Follower, User])],
  providers: [FollowerService],
  controllers: [FollowerController],
})
export class FollowerModule {}
