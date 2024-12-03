import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEventCommand } from 'src/application/commands/create-event.command';
import { DeleteEventCommand } from 'src/application/commands/delete-event.commamd';
import { UpdateEventsCommand } from 'src/application/commands/update.event.command';
import { GetAllEventsQuery } from 'src/application/queries/events/get-all-events.query';
import { GetEventsByCategoryQuery } from 'src/application/queries/events/get-events-by-category.query';
import { GetEventsByIdQuery } from 'src/application/queries/events/get-events-by-id.query';
import { GetEventsByLocationQuery } from 'src/application/queries/events/get-events-by-location.query';
import { SearchEventQuery } from 'src/application/queries/events/search-event.query';
import { Events } from 'src/domain/entities/events.entity';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { CreateEventsDto } from 'src/presentation/dtos/events/create-events.dto';
import { UpdateEventsDto } from 'src/presentation/dtos/events/update-events.dto';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /*
     Get All Events
  */
  @ApiOperation({ description: 'Get All Events' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{events : Events[] | null , total: number; page: number; limit: number}> {
    return this.queryBus.execute(new GetAllEventsQuery(page, limit));
  }

  /*
        Event Creation API Endpoint
    */
  @ApiBody({ type: CreateEventsDto })
  @ApiOperation({ description: 'Create a new event' })
  @HttpCode(200)
  @ApiResponse({
    type: CreateEventsDto,
  })
  /*
      Swagger Api DOCS Description end 
  */
  @Post()
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createEvent(
    @Body() createEventsDto: CreateEventsDto, @CurrentUserId() user: any,
  ): Promise<{ message: string; events: Events }> {
    
    // createEventsDto.user_id = (user.user.user_id).toString();
    const command = new CreateEventCommand(createEventsDto,(user.user.user_id).toString());
    const createdEvent = await this.commandBus.execute(command);
    return { message: 'Event created successfully', events: createdEvent };
  }

  @ApiOperation({ description: 'Get Events By Category' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/category/:category')
  async findByCategory(@Param('category') category: string): Promise<Events[]> {
    return this.queryBus.execute(new GetEventsByCategoryQuery(category));
  }


  @ApiOperation({ description: 'Get Events By Location' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/location/:location')
  async findByLocation(@Param('location') location: string): Promise<Events[]> {
    return this.queryBus.execute(new GetEventsByLocationQuery(location));
  }
  

  @ApiOperation({ description: 'Get Event By ID' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Events | null> {
    return this.queryBus.execute(new GetEventsByIdQuery(id));
  }


  @ApiOperation({ description: 'Get Event By ID' })
  @HttpCode(200)
  // @Roles('User')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/search/:keyword')
  async search(
    @Param('keyword') keyword: string,
    @Query('page') page: number = 1,   // Default value for page if not provided
    @Query('limit') limit: number = 10  // Default value for limit if not provided

): Promise<{events:Events[] | null; total: number; page: number; limit: number }> {
    //  Convert keyword to lowercase before passing it to the query for consistency
    const _keyword = keyword.toLowerCase();

    // Clean up the keyword to remove unnecessary whitespace
    const _keyword_ = keyword.trim();
    return this.queryBus.execute(new SearchEventQuery(_keyword_,page,limit));
  }


  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateEventsDto: UpdateEventsDto,
    @CurrentUserId() user: any,  // This decorator will automatically fetch the user ID from the request context
  ): Promise<Events> {
    const event = await this.queryBus.execute(new GetEventsByIdQuery(id));
    if (!event) throw new Error('Event not found');
    Object.assign(event, updateEventsDto);
    return this.commandBus.execute(new UpdateEventsCommand(id, event,(user.user.user_id).toString()));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string): Promise<void> {
    const event = await this.queryBus.execute(new GetEventsByIdQuery(id));
    if (!event) throw new Error('Event not found');
    await this.commandBus.execute(new DeleteEventCommand(id));
  }
}
