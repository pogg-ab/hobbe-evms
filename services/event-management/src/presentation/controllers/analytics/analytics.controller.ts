import { Controller, Get, HttpCode, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CountMyEventCommand } from 'src/application/queries/analytics/count-my-events.query';
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
     @ApiOperation({ description:"Count All Events"})
        @HttpCode(200)
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Get("general")
        async myEvents(
              @CurrentUserId() user: any,
        ){
           const query = new CountMyEventCommand( user.user.user_id.toString());
           return await this.queryBus.execute(query);
        }
      @ApiOperation({ description:"Single Event Analytics"})
      @HttpCode(200)
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Get("/event/:event")
      async singleEventAnalytics(
            @CurrentUserId() user: any,
            @Param('event') event:string
      ){
         const query = new SingleEventAnalyticsCommand( user.user.user_id.toString(),event);
         return await this.queryBus.execute(query);
      }
}
