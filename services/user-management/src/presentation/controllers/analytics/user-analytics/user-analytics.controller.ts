import { Body, Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SingupSourcesQuery } from 'src/application/queries/analytics/signup-source.query';
import { SingleSingupSourcesQuery } from 'src/application/queries/analytics/single-signup-source.query';

@ApiTags('User Analytics')
@Controller('user-analytics')
export class UserAnalyticsController {
    constructor(
        private readonly queryBus: QueryBus,
    ) {}
    
      @Get('signup-sources')
    //   @ApiBearerAuth('access-token')
    //   @UseGuards(JwtAuthGuard)
      @ApiOperation({ summary: 'count all users signup sources' })
      @ApiResponse({
        status: 200,
        description: 'all user signup sources counters',
      })
      async singupSources(): Promise<any>  {
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



      async singleUserSingupSources(@Param('user_id') user_id:string): Promise<any>  {
        if (!user_id) {
            throw new Error("User ID is required to fetch single signup sources.");
        }
        console.log("User ID:", user_id);
        return await this.queryBus.execute(new SingleSingupSourcesQuery(user_id));
      }
}
