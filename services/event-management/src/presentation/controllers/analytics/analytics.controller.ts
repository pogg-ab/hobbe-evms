import { Controller, Get, HttpCode, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AnalyticsEventCommand } from 'src/application/queries/analytics/analytics-events.query';
import { CountMyEventCommand } from 'src/application/queries/analytics/count-my-events.query';
import { GetUserEventStatsQuery } from 'src/application/queries/analytics/get-user-event-stats.query';
import { SingleEventAnalyticsCommand } from 'src/application/queries/analytics/single-event-analytics.query';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';

@Controller('analytics')
@ApiTags('Analytics')
export class AnalyticsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  @ApiOperation({ description: 'Analytics of All Events' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('general')
  async allEvents(@CurrentUserId() user: any) {
    const query = new AnalyticsEventCommand();
    return await this.queryBus.execute(query);
  }

  @ApiOperation({ description: 'Analytics of All Users Events' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('users-all-events')
  async myEvents(@CurrentUserId() user: any) {
    const query = new CountMyEventCommand(user.user.user_id.toString());
    return await this.queryBus.execute(query);
  }

  @ApiOperation({ description: 'Single Event Analytics' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/event/:event')
  async singleEventAnalytics(
    @CurrentUserId() user: any,
    @Param('event') event: string,
  ) {
    const query = new SingleEventAnalyticsCommand(
      user.user.user_id.toString(),
      event,
    );
    return await this.queryBus.execute(query);
  }

  @ApiOperation({
    summary: 'Get Event Stats for a Specific User',
    description:
      'Returns the number of events the specified user has organized and participated in.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user event stats.',
    schema: {
      example: {
        organized: 5,
        participated: 12,
      },
    },
  })
  //   @ApiBearerAuth('access-token')
  //   @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(200)
  @Get('users/:userId/event-stats')
  async getUserEventStats(@Param('userId') userId: string) {
    const query = new GetUserEventStatsQuery(userId);
    return await this.queryBus.execute(query);
  }
}
