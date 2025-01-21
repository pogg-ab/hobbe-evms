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
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeleteEventSponsorCommand } from 'src/application/commands/event-sponsor/delete-event-sponsor.command';
import { EventSponsorCommand } from 'src/application/commands/event-sponsor/event-sponsor.command';
import { UpdatedEventSponsorCommand } from 'src/application/commands/event-sponsor/update-event-sponsor.command';
import { GetAllEventSponsors } from 'src/application/queries/event-sponsor/find-all-event-sponsors.query';
import { EventSponsorFindById } from 'src/application/queries/event-sponsor/find-event-sponsor-by-id.query';
import { FindEventSponsorsByEventIdQuery } from 'src/application/queries/event-sponsor/find-event-sponsors-by-event-id.query';
import { EventSponsor } from 'src/domain/entities/event-sponsor.entity';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { CreateEventSponsorDto } from 'src/presentation/dtos/event-sponsor/create-event-sponsor.dto';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';

@ApiTags('Event Sponsors')
@Controller('event-sponsors')
export class EventSponsorController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiBody({ type: CreateEventSponsorDto })
  @ApiOperation({ description: 'Create a new Event Sponsor' })
  @HttpCode(200)
  @Post()
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(
    @Body() createEventSponsorDto: CreateEventSponsorDto,
  ): Promise<EventSponsor> {
    const command = new EventSponsorCommand(createEventSponsorDto);
    return await this.commandBus.execute(command);
  }

  @ApiOperation({ description: 'Get All Event Sponsors' })
  @HttpCode(200)
  @Get()
  async findAll() {
    const query = new GetAllEventSponsors();
    return await this.queryBus.execute(query);
  }

  @ApiOperation({ description: 'Find Event Sponsor By ID' })
  @HttpCode(200)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const query = new EventSponsorFindById(id);
    return await this.queryBus.execute(query);
  }

  @ApiOperation({ description: 'Get Event Sponsors by Event ID' })
  @HttpCode(200)
  @Get('event/:eventId')
  async findByEventId(@Param('eventId') eventId: string) {
    const query = new FindEventSponsorsByEventIdQuery(eventId);
    return await this.queryBus.execute(query);
  }

  @ApiOperation({ description: 'Update Event Sponsor' })
  @ApiBody({ type: CreateEventSponsorDto })
  @HttpCode(200)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() createEventSponsorDto: CreateEventSponsorDto,
  ) {
    const eventSponsor = await this.queryBus.execute(
      new EventSponsorFindById(id),
    );
    if (!eventSponsor) {
      return 'Event Sponsor Not Found';
    }
    Object.assign(eventSponsor, createEventSponsorDto);
    return await this.commandBus.execute(
      new UpdatedEventSponsorCommand(id, eventSponsor),
    );
  }

  @ApiOperation({ description: 'Delete Event Sponsor' })
  @HttpCode(200)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const eventSponsor = await this.queryBus.execute(
      new EventSponsorFindById(id),
    );
    if (!eventSponsor) {
      return 'Event Sponsor Not Found';
    }
    return await this.commandBus.execute(new DeleteEventSponsorCommand(id));
  }
}
