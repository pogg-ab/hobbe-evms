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
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }


    @Get('user/:id')
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

    @Get()
    @UseGuards(JwtAuthGuard)
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
        const response = await this.queryBus.execute(new FindAllUsersQuery(page, limit));

        const filteredUsers = response.users.filter(user => user.user_id.toString() !== currentUser.user.user_id.toString());

        return filteredUsers;
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update user details' })
    @ApiResponse({
        status: 200,
        description: 'User updated successfully',
        type: User,
    })
    async update(
        @Param('id') user_id: UserID,
        @Body() updateUserDto: UpdateUserDto,
        @CurrentUserId() currentUser: any,
    ): Promise<User> {
        if (user_id.toString() !== currentUser.user.user_id.toString()) {
            throw new BadRequestException('You cannot update another user\'s details');
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
}
