import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEventCommand } from 'src/application/commands/create-event.command';
import { GetAllEventsQuery } from 'src/application/queries/events/get-all-events.query';
import { Events } from 'src/domain/entities/events.entity';
import { CreateEventsDto } from 'src/presentation/dtos/create-events.dto';

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
  async createEvent(
    @Body() createEventsDto: CreateEventsDto,
  ): Promise<{ message: string; events: Events }> {
    const command = new CreateEventCommand(createEventsDto);
    const createdEvent = await this.commandBus.execute(command);
    return { message: 'Event created successfully', events: createdEvent };
  }
}
