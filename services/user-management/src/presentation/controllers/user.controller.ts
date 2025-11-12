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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FindAllUsersQuery } from 'src/application/queries/user/find-all-users.query';
import { FindUserByIdQuery } from 'src/application/queries/user/find-user-by-id.query';
import { User } from 'src/domain/entities/user.entity';
import { UserResponseDto } from '../dtos/user-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Any } from 'typeorm';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { CurrentUserId } from '../decorators/currentUserId.decorater';
import { UserID } from 'src/domain/value-objects/user-id.value-object';
import { UpdateUserCommand } from 'src/application/commands/user/update-user.command';
import { SearchUsersQuery } from 'src/application/queries/user/search-users.query';
import { SearchFilters } from '../dtos/search-filters.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from 'src/application/services/user.service';
import { SuspendUserCommand } from 'src/application/commands/user/suspend-user.command';
import { ReactivateUserCommand } from 'src/application/commands/user/reactivate-user.command';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { SearchAllUsersQuery } from 'src/application/queries/user/search-all-users.query';
import { UseInterceptors } from '@nestjs/common';
import { AuditLogInterceptor } from '../interceptors/audit-log.interceptor';
import { AuditLog } from '../decorators/audit-log.decorator';
import { ActionType } from 'src/domain/entities/audit-log.entity';

@ApiTags('Users')
@Controller('users')
@UseInterceptors(AuditLogInterceptor)
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly userService: UserService,
  ) {}

  @Get('user/:id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user details by ID' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: [Any || null],
  })
  async findUserById(@Param('id') id: string): Promise<User> {
    return this.queryBus.execute(new FindUserByIdQuery(id));
  }

  @Get('admin/user/:id')
  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get user details by ID' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: [Any || null],
  })
  async adminFindUserById(@Param('id') id: string): Promise<User> {
    return this.queryBus.execute(new FindUserByIdQuery(id));
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [Any || null],
  })
  async findAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<any | null> {
    return this.queryBus.execute(new FindAllUsersQuery(page, limit));
  }

  @Get('exclude-me')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all users excluding the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of all users excluding the current user',
    type: [Any || null],
  })
  async findAllUsersExcludingCurrent(
    @CurrentUserId() currentUser: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<any | null> {
    const response = await this.queryBus.execute(
      new FindAllUsersQuery(page, limit),
    );

    const filteredUsers = response.users.filter(
      (user) => user.user_id.toString() !== currentUser.user.user_id.toString(),
    );

    return filteredUsers;
  }

 @Put(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user details' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
  })
  // --- START OF RESOLVED CODE ---
  @ApiParam({
    name: 'id',
    description: 'The unique user ID (UUID)',
    example: 'f86fb35f-269a-4de2-9a3a-9777133b066e',
    type: String,
  })
  @AuditLog({
    actionType: ActionType.UPDATE_USER,
    targetEntity: 'User',
  })
  // --- END OF RESOLVED CODE ---
  async update(
    @Param('id') user_id: UserID,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUserId() currentUser: any,
  ): Promise<User> {
    if (user_id.toString() !== currentUser.user.user_id.toString()) {
      throw new BadRequestException("You cannot update another user's details");
    }
    const user = await this.queryBus.execute(
      new FindUserByIdQuery(user_id.toString()),
    );

    if (!user) {
      throw new BadRequestException('User not found');
    }

    Object.assign(user, updateUserDto);

    return this.commandBus.execute(new UpdateUserCommand(user_id, user));
  }
  @Get('search-organizer')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Search users by name or email' })
  @ApiResponse({
    status: 200,
    description: 'List of users matching search criteria',
    type: [UserResponseDto],
  })
  async searchUsers(
    @Query('query') query: string,
    @Query() filters: SearchFilters,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<User[]> {
    return this.queryBus.execute(
      new SearchUsersQuery(query, filters, page, limit),
    );
  }

  @Get('admin/search-organizer')
  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Search users by name or email' })
  @ApiResponse({
    status: 200,
    description: 'List of users matching search criteria',
    type: [UserResponseDto],
  })
  async searchUsersAdmin(
    @Query('query') query: string,
    @Query() filters: SearchFilters,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<User[]> {
    return this.queryBus.execute(
      new SearchUsersQuery(query, filters, page, limit),
    );
  }

  @Get('admin/search-all-organizers')
  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Search users by name or email' })
  @ApiResponse({
    status: 200,
    description: 'List of users matching search criteria',
    type: [UserResponseDto],
  })
  async adminSearchAllUsers(
    @Query('query') query: string,
    @Query() filters: SearchFilters,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<User[]> {
    return this.queryBus.execute(
      new SearchAllUsersQuery(query, filters, page, limit),
    );
  }

  @MessagePattern('get-user-info')
  async handleGetUserInfo(@Payload() payload: any) {
    try {
      if (!payload.userIds || !Array.isArray(payload.userIds)) {
        throw new BadRequestException('Invalid user IDs format');
      }

      return await this.userService.getUserInfo(payload.userIds);
    } catch (error) {
      console.error('Error in getUserInfo message handler:', error);
      throw error;
    }
  }

  @Put('suspend/:id')
  //   @ApiBearerAuth('access-token')
  //   @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Suspend a user account' })
  @ApiResponse({
    status: 200,
    description: 'User suspended successfully',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'User not found',
  })
  @AuditLog({
    actionType: ActionType.UPDATE_USER,
    targetEntity: 'User',
})
  async suspendUser(@Param('id') userId: string): Promise<User> {
    return this.commandBus.execute(new SuspendUserCommand(userId));
  }

  @Put('reactivate/:id')
  // @ApiBearerAuth('access-token')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Reactivate a suspended user account' })
  @ApiResponse({
    status: 200,
    description: 'User account reactivated successfully',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'User not found or already active',
  })
  async reactivateUser(@Param('id') userId: string): Promise<User> {
    return this.commandBus.execute(new ReactivateUserCommand(userId));
  }
  @Get('internal/all-ids')
  @ApiOperation({
    summary: 'FOR INTERNAL USE ONLY: Get a list of all user IDs',
  })
  @ApiResponse({ status: 200, description: 'An array of all user UUIDs.' })
  async getAllUserIds(): Promise<string[]> {
    return this.userService.getAllUserIds();
  }
  @MessagePattern('get_all_user_ids')
  async handleGetAllUserIdsForRPC(): Promise<string[]> {
    return this.userService.getAllUserIds();
  }
}
