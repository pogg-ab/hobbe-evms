import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
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
import { Events } from 'src/domain/entities/events.entity';
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll(): Promise<Events[]> {
    return this.queryBus.execute(new GetAllEventsQuery());
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
    @Body() createEventsDto: CreateEventsDto,
  ): Promise<{ message: string; events: Events }> {
    const command = new CreateEventCommand(createEventsDto);
    const createdEvent = await this.commandBus.execute(command);
    return { message: 'Event created successfully', events: createdEvent };
  }

  @ApiOperation({ description: 'Get Events By Category' })
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/category/:category')
  async findByCategory(@Param('category') category: string): Promise<Events[]> {
    return this.queryBus.execute(new GetEventsByCategoryQuery(category));
  }


  @ApiOperation({ description: 'Get Events By Location' })
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/location/:location')
  async findByLocation(@Param('location') location: string): Promise<Events[]> {
    return this.queryBus.execute(new GetEventsByLocationQuery(location));
  }
  

  @ApiOperation({ description: 'Get Event By ID' })
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Events | null> {
    return this.queryBus.execute(new GetEventsByIdQuery(id));
  }


  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateEventsDto: UpdateEventsDto,
  ): Promise<Events> {
    const event = await this.queryBus.execute(new GetEventsByIdQuery(id));
    if (!event) throw new Error('Event not found');
    Object.assign(event, updateEventsDto);
    return this.commandBus.execute(new UpdateEventsCommand(id, event));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string): Promise<void> {
    const event = await this.queryBus.execute(new GetEventsByIdQuery(id));
    if (!event) throw new Error('Event not found');
    await this.commandBus.execute(new DeleteEventCommand(id));
  }
}
