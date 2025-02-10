
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateFollowCommand } from 'src/application/commands/follower/create-follow.command';
import { AcceptFollowRequestCommand } from 'src/application/commands/follower/accept-follow-request.command';
import { RemoveFollowCommand } from 'src/application/commands/follower/remove-follow.command';
import { FindAllFollowersQuery } from 'src/application/queries/follower/find-all-followers.query';
import { FindFollowStatusQuery } from 'src/application/queries/follower/find-follow-status.query';
import { Follower } from 'src/domain/entities/follower.entity';
import { FollowStatus } from 'src/domain/value-objects/follow-status.value-object';
import { CreateFollowDto } from '../dtos/create-follow.dto';
import { AcceptFollowDto } from '../dtos/accept-follow.dto';
import { FollowStatusResponseDto } from '../dtos/follow-status-response.dto';
import { UnfollowCommand } from 'src/application/commands/follower/unfollow.command';
import { UnblockCommand } from 'src/application/commands/follower/unblock.command';
import { BlockCommand } from 'src/application/commands/follower/block.command';
import { FindFollowerByIdQuery } from 'src/application/queries/follower/find-follower-by-id.query';
import { FollowID } from 'src/domain/value-objects/follower-id.value-object';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUserId } from '../decorators/currentUserId.decorater';
import { FindAllFollowingQuery } from 'src/application/queries/follower/find-all-following.query';
@ApiTags('Followers')
@Controller('followers')
export class FollowerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Post('follow')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Follow a user' })
  @ApiBody({ type: CreateFollowDto })
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: 'Follow request created successfully',
    type: Follower,
  })
  async create(
    @Body() createFollowDto: CreateFollowDto,
  ): Promise<{ message: string }> {
    const command = new CreateFollowCommand(createFollowDto);
    const follow = await this.commandBus.execute(command);

    return {
      message: 'Follow request created successfully',
    };
  }

  @Post('accept/:followerId/:followingId')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Accept a follow request' })
  @ApiBody({ type: AcceptFollowDto })
  @ApiResponse({
    status: 200,
    description: 'Follow request accepted',
    type: Follower,
  })
  async acceptFollowRequest(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string,
  ): Promise<Follower> {
    const command = new AcceptFollowRequestCommand(followerId, followingId);
    const acceptedFollow = await this.commandBus.execute(command);

    return acceptedFollow;
  }

  @Get('status/:followerId/:followingId')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get follow status between two users' })
  @ApiResponse({
    status: 200,
    description: 'Follow status between two users',
    type: FollowStatusResponseDto,
  })
  async findFollowStatus(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string,
  ): Promise<FollowStatus> {
    return this.queryBus.execute(new FindFollowStatusQuery(followerId, followingId));
  }

  @Get('all-followers')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all followers for a user with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of all followers for a user with pagination',
    type: [Follower],
  })
  async findAllFollowers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @CurrentUserId() currentUser: any,
  ): Promise<{
    followers: Follower[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    const userId = currentUser.user.user_id.toString()
    const { followers, total } = await this.queryBus.execute(
      new FindAllFollowersQuery(userId, page, limit)
    );

    return {
      followers,
      total,
      page,
      limit,
    };
  }

  @Get('all-following')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all followers for a user with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of all followers for a user with pagination',
    type: [Follower],
  })
  async findAllFollowings(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @CurrentUserId() currentUser: any,
  ): Promise<{
    following: Follower[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    const userId = currentUser.user.user_id.toString()
    const { following, total } = await this.queryBus.execute(
      new FindAllFollowingQuery(userId, page, limit)
    );

    return {
      following,
      total,
      page,
      limit,
    };
  }


  @Get(':followId')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Find a follower by ID' })
  @ApiResponse({
    status: 200,
    description: 'Follower found by ID',
    type: Follower,
  })
  async findFollowerById(@Param('followId') followId: string): Promise<Follower | null> {
    const follow = new FollowID(followId)
    return this.queryBus.execute(new FindFollowerByIdQuery(new FollowID(followId)));
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove a follow relationship' })
  @ApiResponse({
    status: 200,
    description: 'Follow relationship removed successfully',
  })
  async removeFollow(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new RemoveFollowCommand(new FollowID(id)));
  }

  @Delete('unfollow/:followerId/:followingId')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiResponse({
    status: 200,
    description: 'Unfollow relationship removed successfully',
  })
  async unfollow(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string,
  ): Promise<{ message: string }> {
    const command = new UnfollowCommand(followerId, followingId);
    await this.commandBus.execute(command);
    return { message: 'Unfollow request processed successfully' };
  }

  @Post('block/:followerId/:followingId')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Block a user' })
  @ApiResponse({
    status: 200,
    description: 'User blocked successfully',
  })
  async block(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string,
  ): Promise<Follower> {
    const command = new BlockCommand(followerId, followingId);
    return this.commandBus.execute(command);
  }

  @Post('unblock/:followerId/:followingId')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Unblock a user' })
  @ApiResponse({
    status: 200,
    description: 'User unblocked successfully',
  })
  async unblock(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string,
  ): Promise<Follower> {
    const command = new UnblockCommand(followerId, followingId);
    return this.commandBus.execute(command);
  }
}
