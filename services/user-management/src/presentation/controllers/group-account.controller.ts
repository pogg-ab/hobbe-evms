import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GroupAccount } from 'src/domain/entities/group-account.entity';
import { CreateGroupAccountDto } from '../dtos/group-account/create-group-account.dto';
import { CreateGroupAccountCommand } from 'src/application/commands/group-account/create-group-account.command';
import { RemoveGroupAccountCommand } from 'src/application/commands/group-account/remove-group-account.command';
import { GetGroupAccountsQuery } from 'src/application/queries/group-account/get-group-accounts.query';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUserId } from '../decorators/currentUserId.decorater';

@ApiTags('Group Accounts')
@Controller('group-accounts')
export class GroupAccountController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    @Post()
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a group account relationship' })
    @ApiBody({ type: CreateGroupAccountDto })
    @HttpCode(201)
    @ApiResponse({
        status: 201,
        description: 'Group account relationship created successfully',
        type: GroupAccount,
    })
    async createGroupAccount(
        @Body() createGroupAccountDto: CreateGroupAccountDto,
        @CurrentUserId() currentUser: any,
    ): Promise<{ message: string; groupAccount: GroupAccount }> {
        const userId = currentUser.user.user_id.toString();
        const command = new CreateGroupAccountCommand(createGroupAccountDto, userId);
        const groupAccount = await this.commandBus.execute(command);

        return {
            message: 'Group account relationship created successfully',
            groupAccount,
        };
    }

    @Delete(':groupAccountId')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Remove a group account relationship' })
    @ApiResponse({
        status: 200,
        description: 'Group account relationship removed successfully',
    })
    async removeGroupAccount(
        @Param('groupAccountId') groupAccountId: string,
        @CurrentUserId() currentUser: any,
    ): Promise<{ message: string }> {
        const userId = currentUser.user.user_id.toString();
        const command = new RemoveGroupAccountCommand(groupAccountId, userId);
        await this.commandBus.execute(command);

        return { message: 'Group account relationship removed successfully' };
    }

    @Get('user')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get all group accounts for a user' })
    @ApiResponse({
        status: 200,
        description: 'List of all group accounts for the user',
        type: [GroupAccount],
    })
    async findGroupAccounts(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @CurrentUserId() currentUser: any,
    ): Promise<{
        groupAccounts: GroupAccount[] | null;
        total: number;
        page: number;
        limit: number;
    }> {
        const userId = currentUser.user.user_id.toString();
        const { groupAccounts, total } = await this.queryBus.execute(
            new GetGroupAccountsQuery(userId, page, limit),
        );
        return {
            groupAccounts,
            total,
            page,
            limit,
        };
    }
}