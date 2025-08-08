import { Body, Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetActiveUsersQuery } from 'src/application/queries/analytics/get-active-users.query';
import { SingupSourcesQuery } from 'src/application/queries/analytics/signup-source.query';
import { SingleSingupSourcesQuery } from 'src/application/queries/analytics/single-signup-source.query';
import { PaginationDto } from 'src/presentation/dtos/pagination.dto';

@ApiTags('User Analytics')
@Controller('user-analytics')
export class UserAnalyticsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('signup-sources')
  //   @ApiBearerAuth('access-token')
  //   @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'count all users signup sources' })
  @ApiResponse({
    status: 200,
    description: 'all user signup sources counters',
  })
  async singupSources(): Promise<any> {
    return await this.queryBus.execute(new SingupSourcesQuery());
  }

  @Get('/user-signup-sources/:user_id')
  //   @ApiBearerAuth('access-token')
  //   @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'users signup sources' })
  @ApiResponse({
    status: 200,
    description: 'user signup sources',
  })
  async singleUserSingupSources(
    @Param('user_id') user_id: string,
  ): Promise<any> {
    if (!user_id) {
      throw new Error('User ID is required to fetch single signup sources.');
    }
    console.log('User ID:', user_id);
    return await this.queryBus.execute(new SingleSingupSourcesQuery(user_id));
  }

  @Get('active-users/daily')
  // @ApiBearerAuth('access-token')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get daily active users' })
  @ApiResponse({
    status: 200,
    description: 'List of users active today',
  })
  async getDailyActiveUsers(@Query() pagination: PaginationDto): Promise<any> {
    return this.queryBus.execute(
      new GetActiveUsersQuery('daily', pagination.page, pagination.limit),
    );
  }

  @Get('active-users/weekly')
  // @ApiBearerAuth('access-token')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get weekly active users' })
  @ApiResponse({
    status: 200,
    description: 'List of users active this week',
  })
  async getWeeklyActiveUsers(@Query() pagination: PaginationDto): Promise<any> {
    return this.queryBus.execute(
      new GetActiveUsersQuery('weekly', pagination.page, pagination.limit),
    );
  }

  @Get('active-users/monthly')
  // @ApiBearerAuth('access-token')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get monthly active users' })
  @ApiResponse({
    status: 200,
    description: 'List of users active this month',
  })
  async getMonthlyActiveUsers(
    @Query() pagination: PaginationDto,
  ): Promise<any> {
    return this.queryBus.execute(
      new GetActiveUsersQuery('monthly', pagination.page, pagination.limit),
    );
  }
}
