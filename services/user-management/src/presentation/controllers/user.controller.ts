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
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindAllUsersQuery } from 'src/application/queries/user/find-all-users.query';
import { FindUserByIdQuery } from 'src/application/queries/user/find-user-by-id.query';
import { User } from 'src/domain/entities/user.entity';
import { UserResponseDto } from '../dtos/user-response.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }


    @Get(':id')
    @ApiOperation({ summary: 'Get user details by ID' })
    @ApiResponse({
        status: 200,
        description: 'User found',
        type: UserResponseDto,
    })
    async findUserById(@Param('user_id') user_id: string): Promise<User> {
        return this.queryBus.execute(new FindUserByIdQuery(user_id));
    }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({
        status: 200,
        description: 'List of all users',
        type: [UserResponseDto],
    })
    async findAllUsers(): Promise<any | null> {
        return this.queryBus.execute(new FindAllUsersQuery());
    }
}
