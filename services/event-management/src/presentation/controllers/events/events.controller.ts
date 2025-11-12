import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateEventCommand } from 'src/application/commands/create-event.command';
import { DeleteEventCommand } from 'src/application/commands/delete-event.commamd';
import { UpdateEventsCommand } from 'src/application/commands/update.event.command';
import { FindEventsByOrganiserQuery } from 'src/application/queries/events/find-event-by-organiser.query';
import { FindEventsBySpecificDate } from 'src/application/queries/events/find-event-by-specific-date.query';
import { FindEventsByThisWeekendQuery } from 'src/application/queries/events/find-event-by-this-weekend.query';
import { FindEventsByDateRangeQuery } from 'src/application/queries/events/find-events-by-daterange.query';
import { FindEventsByUserQuery } from 'src/application/queries/events/find-events-by-user.query';
import { GetAllEventsQuery } from 'src/application/queries/events/get-all-events.query';
import { GetEventsByCategoryQuery } from 'src/application/queries/events/get-events-by-category.query';
import { GetEventsByIdQuery } from 'src/application/queries/events/get-events-by-id.query';
import { GetEventsByLocationQuery } from 'src/application/queries/events/get-events-by-location.query';
import { SearchEventQuery } from 'src/application/queries/events/search-event.query';
import { Events } from 'src/domain/entities/events.entity';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { CreateEventsDto } from 'src/presentation/dtos/events/create-events.dto';
import { UpdateEventsDto } from 'src/presentation/dtos/events/update-events.dto';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/infrastructure/file-upload/multer.config';
import { FindEventsByUsersFavoriteQuery } from 'src/application/queries/favorite/find-events-by-users-favorite.query';
import { GetEventRemainingTimeQuery } from 'src/application/queries/events/get-event-remaining-time.query';
import { GetEventsByStatusQuery } from 'src/application/queries/events/get-events-by-status.query';
import { GetEventsByDateRnage } from 'src/presentation/dtos/events/get-event-by-date-range.dto';
import { GetAllEventsByAuthQuery } from 'src/application/queries/events/get-all-events-by-auth.query';
import { GetAllEventsByAuthQueryHandler } from 'src/application/handlers/events/get-all-events-by-auth.handler';
import { FindEventsByUserAndStatusQuery } from 'src/application/queries/events/find-events-by-user-and-status.query';
import { AuditLogInterceptor } from 'src/presentation/interceptors/audit-log.interceptor';
import { Permissions } from 'src/presentation/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/presentation/guards/permissions.guard';
import { UniversalAuthGuard } from 'src/presentation/guards/universal-auth.guard';
import { FilterEventsDto } from 'src/presentation/dtos/events/filter-events.dto';
import { GetFilteredEventsQuery } from 'src/application/queries/events/get-filtered-events.query';
import { FindAllEventsResponseDto } from 'src/presentation/dtos/events/find-all-events-response.dto';
import { TicketSalesOverviewResponseDto } from 'src/presentation/dtos/events/ticket-sales-overview-response.dto';
import { GetTicketSalesOverviewQuery } from 'src/application/queries/events/get-ticket-sales-overview.query';
import {
  ApproveEventDto,
  CancelEventDto,
  RejectEventDto,
  RequestEventChangesDto,
  SetEventPendingDto,
} from 'src/presentation/dtos/events/event-status.dto';
import {
  ApproveEventCommand,
  CancelEventCommand,
  RejectEventCommand,
  RequestEventChangesCommand,
  SetEventPendingCommand,
} from 'src/application/commands/event-status.commands';
import { AdminUpdateEventCommand } from 'src/application/commands/admin-update-event.command';
import { AdminUpdateEventsDto } from 'src/presentation/dtos/events/admin-update-events.dto';
import { GetParticipatedEventsQuery } from 'src/application/queries/events/get-participated-events.query';
import { AuditLog } from 'src/presentation/decorators/audit-log.decorator';
import { ActionType } from 'src/domain/entities/audit-log.entity';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @ApiOperation({ description: 'Gust Get All Events' })
  @HttpCode(200)
  @Get('get-events-as-gust')
  async findAllAsGust(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{
    events: Events[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    // get all events as gust
    return await this.queryBus.execute(new GetAllEventsQuery(page, limit));
  }

  @ApiOperation({ description: 'Get All Events' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(
    @CurrentUserId() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{
    events: Events[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    const userId = user.user.user_id.toString();
    return await this.queryBus.execute(
      new GetAllEventsByAuthQuery(userId, page, limit),
    );
  }

  @ApiOperation({ description: 'Get All Events' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'Events retrieved successfully',
    type: FindAllEventsResponseDto,
  })
  @Permissions('view:Event')
  @UseGuards(UniversalAuthGuard, PermissionsGuard)
  @Get('all-events')
  async findAllEvents(@Query() filterEventsDto: FilterEventsDto): Promise<{
    events: Events[] | null;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    filters: FilterEventsDto;
  }> {
    const result = await this.queryBus.execute(
      new GetFilteredEventsQuery(filterEventsDto),
    );

    return {
      events: result.events,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      filters: filterEventsDto,
    };
  }

  @ApiBody({ type: CreateEventsDto })
  @ApiOperation({ description: 'Create a new event' })
  @HttpCode(200)
  @ApiResponse({
    type: CreateEventsDto,
  })
  @Post()
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseInterceptors(AuditLogInterceptor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileInterceptor('thumbnail', multerConfig('thumbnail')),
    // FileInterceptor('cover_image', multerConfig('cover_image'))  // For 'cover_image' field, allows 1 file only
  )
  @AuditLog({
    actionType: ActionType.CREATE_EVENT,
    targetEntity: 'Event',
  })
  async createEvent(
    @Body() createEventsDto: CreateEventsDto,
    @UploadedFiles() thumbnails: Express.Multer.File[],
    // @UploadedFile() cover_image: Express.Multer.File,
    @CurrentUserId() user: any,
  ): Promise<{ message: string; events: Events }> {
    // createEventsDto.user_id = (user.user.user_id).toString();

    // If a thumbnail file is uploaded, assign its path to the DTO
    if (thumbnails && thumbnails.length > 0) {
      createEventsDto.thumbnails = thumbnails.map((file) => file.path);
    }
    // If a cover image file is uploaded, assign its path to the DTO
    //  if (cover_image) createEventsDto.cover_image = cover_image.path;

    const command = new CreateEventCommand(
      createEventsDto,
      user.user.user_id.toString(),
    );
    const createdEvent = await this.commandBus.execute(command);
    return { message: 'Event created successfully', events: createdEvent };
  }

  @ApiOperation({ description: 'Get Events By User' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('find-by-user')
  async findByUser(@CurrentUserId() user: any): Promise<Events[]> {
    return await this.queryBus.execute(
      new FindEventsByUserQuery(user.user.user_id.toString()),
    );
  }

  @ApiOperation({ description: 'Get Events By User and event status' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('find-by-user/:status')
  async findByUserAndStatus(
    @CurrentUserId() user: any,
    @Param('status') status: string,
  ): Promise<any> {
    const userId = user.user.user_id.toString();
    // Validate the status parameter else // throw descriptive error to frontend dev
    const validStatuses = ['past', 'future', 'drafted'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`,
      );
    }
    return this.queryBus.execute(
      new FindEventsByUserAndStatusQuery(userId, status),
    );
  }

  @ApiOperation({ description: 'Get This Weekend Events' })
  @HttpCode(200)
  @Get('/this-weekend-events')
  async findByThisWeekend(): Promise<Events[] | []> {
    return this.queryBus.execute(new FindEventsByThisWeekendQuery());
  }
  @ApiOperation({ description: 'Get Events By Specific Date' })
  @HttpCode(200)
  @Get('/date/:date')
  async findBySpecificDate(@Param('date') date: Date): Promise<Events[] | []> {
    return this.queryBus.execute(new FindEventsBySpecificDate(date));
  }

  @ApiOperation({ description: 'Get Events By  Daterange' })
  @ApiBody({ type: GetEventsByDateRnage })
  @HttpCode(200)
  @Post('date-range')
  async findByDateRange(
    @Body() body: { startDate: Date; endDate: Date },
  ): Promise<Events[] | []> {
    const { startDate, endDate } = body;
    return this.queryBus.execute(
      new FindEventsByDateRangeQuery(startDate, endDate),
    );
  }

  @ApiOperation({ description: 'Get Event By ID' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Events | null> {
    // Validate the ID format of uuid
    if (
      !id ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    ) {
      throw new BadRequestException('Invalid event ID format');
    }

    return this.queryBus.execute(new GetEventsByIdQuery(id));
  }

  @ApiOperation({ description: 'Get Event By ID' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Permissions('view:Event')
  @UseGuards(UniversalAuthGuard, PermissionsGuard)
  @Get('/admin/:id')
  async adminFindOne(@Param('id') id: string): Promise<Events | null> {
    if (
      !id ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    ) {
      throw new BadRequestException('Invalid event ID format');
    }

    return this.queryBus.execute(new GetEventsByIdQuery(id));
  }

  @ApiOperation({ description: 'Update Event' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @Patch(':id')
  @UseInterceptors(AuditLogInterceptor)
  @UseGuards(JwtAuthGuard, RolesGuard)
   @AuditLog({
    actionType: ActionType.UPDATE_EVENT,
    targetEntity: 'Event',
  })
  async update(
    @Param('id') id: string,
    @Body() updateEventsDto: UpdateEventsDto,
    @CurrentUserId() user: any,
  ): Promise<Events> {
    // const event = await this.queryBus.execute(new GetEventsByIdQuery(id));
    // if (!event) throw new Error('Event not found');
    // Object.assign(event, updateEventsDto);
    const command = new UpdateEventsCommand(
      id,
      updateEventsDto,
      user.user.user_id.toString(),
    );
    return this.commandBus.execute(command);
  }

  @ApiOperation({ description: 'Delete Event By ID' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @Delete(':id')
  @UseInterceptors(AuditLogInterceptor)
  @UseGuards(JwtAuthGuard, RolesGuard)
   @AuditLog({
    actionType: ActionType.DELETE_EVENT,
    targetEntity: 'Event',
  })
  async remove(@Param('id') id: string): Promise<void> {
    const event = await this.queryBus.execute(new GetEventsByIdQuery(id));
    if (!event) throw new Error('Event not found');
    await this.commandBus.execute(new DeleteEventCommand(id));
  }

  @ApiOperation({ description: 'Search Event' })
  @HttpCode(200)
  @Get('/search/:keyword')
  async search(
    @Param('keyword') keyword: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
  ): Promise<{
    events: Events[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    const _keyword = keyword.toLowerCase();
    const _keyword_ = keyword.trim();
    return this.queryBus.execute(new SearchEventQuery(_keyword_, page, limit));
  }

  @ApiOperation({ description: 'Get Events By Category' })
  @HttpCode(200)
  @Get('/category/:category')
  async findByCategory(@Param('category') category: string): Promise<Events[]> {
    return this.queryBus.execute(new GetEventsByCategoryQuery(category));
  }

  @ApiOperation({ description: 'Get Events By Status' })
  @HttpCode(200)
  @Get('/status/:status')
  async findByStatus(@Param('status') status: string): Promise<Events[]> {
    return this.queryBus.execute(new GetEventsByStatusQuery(status));
  }

  @ApiOperation({ description: 'Get Events By Location' })
  @HttpCode(200)
  @Get('/location/:location')
  async findByLocation(@Param('location') location: string): Promise<Events[]> {
    return this.queryBus.execute(new GetEventsByLocationQuery(location));
  }

  @ApiOperation({ description: 'Get Events By Organiser ID' })
  @HttpCode(200)
  @Get('/organiser/:organiser')
  async findByOrganiser(
    @Param('organiser') organiser: string,
  ): Promise<Events[]> {
    return this.queryBus.execute(new FindEventsByOrganiserQuery(organiser));
  }

  @ApiOperation({ description: 'Get Event Remaining Time ' })
  @ApiResponse({
    description: 'Remaining time until event in format D: HH:MM:SS',
    type: String,
  })
  @HttpCode(200)
  @Get('/remaining-time/:event_id')
  async getRemainingTime(
    @Param('event_id') event_id: string,
  ): Promise<{ remainingTime: string }> {
    const event: Events = await this.queryBus.execute(
      new GetEventsByIdQuery(event_id),
    );

    if (!event) {
      throw new Error('Event not found');
    }

    return await this.queryBus.execute(
      new GetEventRemainingTimeQuery(event_id),
    );
  }

  @ApiOperation({ description: 'Get Ticket Sales Overview for an Event' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'Ticket sales overview retrieved successfully',
    type: TicketSalesOverviewResponseDto,
  })
  @Permissions('view:Event')
  @UseGuards(UniversalAuthGuard, PermissionsGuard)
  @Get(':id/ticket-sales-overview')
  async getTicketSalesOverview(
    @Param('id') eventId: string,
  ): Promise<TicketSalesOverviewResponseDto> {
    return await this.queryBus.execute(
      new GetTicketSalesOverviewQuery(eventId),
    );
  }

  @ApiOperation({ description: 'Approve an Event' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'Event approved successfully',
    type: Events,
  })
  @ApiBody({ type: ApproveEventDto })
  @Permissions('view:Event')
  @UseGuards(UniversalAuthGuard, PermissionsGuard)
  @Post(':id/approve')
  @AuditLog({
    actionType: ActionType.APPROVE_EVENT,
    targetEntity: 'Event',
  })
  async approveEvent(
    @Param('id') eventId: string,
    @Body() approveEventDto: ApproveEventDto,
    @CurrentUserId() user: any,
  ): Promise<Events> {
    const adminId = user.user_id;
    return await this.commandBus.execute(
      new ApproveEventCommand(eventId, approveEventDto.feedback, adminId),
    );
  }

  @ApiOperation({ description: 'Reject an Event' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'Event rejected successfully',
    type: Events,
  })
  @ApiBody({ type: RejectEventDto })
  @Permissions('view:Event')
  @UseGuards(UniversalAuthGuard, PermissionsGuard)
  @Post(':id/reject')
  async rejectEvent(
    @Param('id') eventId: string,
    @Body() rejectEventDto: RejectEventDto,
    @CurrentUserId() user: any,
  ): Promise<Events> {
    const adminId = user.user_id;
    return await this.commandBus.execute(
      new RejectEventCommand(eventId, rejectEventDto.feedback, adminId),
    );
  }

  @ApiOperation({ description: 'Request Changes for an Event' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'Changes requested successfully',
    type: Events,
  })
  @ApiBody({ type: RequestEventChangesDto })
  @Permissions('view:Event')
  @UseGuards(UniversalAuthGuard, PermissionsGuard)
  @Post(':id/request-changes')
  async requestEventChanges(
    @Param('id') eventId: string,
    @Body() requestEventChangesDto: RequestEventChangesDto,
    @CurrentUserId() user: any,
  ): Promise<Events> {
    const adminId = user.user_id;
    return await this.commandBus.execute(
      new RequestEventChangesCommand(
        eventId,
        requestEventChangesDto.feedback,
        adminId,
      ),
    );
  }

  @ApiOperation({ description: 'Set Event to Pending Status' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'Event set to pending status successfully',
    type: Events,
  })
  @ApiBody({ type: SetEventPendingDto })
  @Permissions('view:Event')
  @UseGuards(UniversalAuthGuard, PermissionsGuard)
  @Post(':id/set-pending')
  async setEventPending(
    @Param('id') eventId: string,
    @Body() setPendingDto: SetEventPendingDto,
    @CurrentUserId() user: any,
  ): Promise<Events> {
    const userId = user.user_id;
    return await this.commandBus.execute(
      new SetEventPendingCommand(eventId, setPendingDto.feedback, userId),
    );
  }

  @ApiOperation({ description: 'Cancel an Event' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'Event cancelled successfully',
    type: Events,
  })
  @ApiBody({ type: CancelEventDto })
  @Permissions('view:Event')
  @UseGuards(UniversalAuthGuard, PermissionsGuard)
  @Post(':id/cancel')
  async cancelEvent(
    @Param('id') eventId: string,
    @Body() cancelEventDto: CancelEventDto,
    @CurrentUserId() user: any,
  ): Promise<Events> {
    const userId = user.user_id;
    return await this.commandBus.execute(
      new CancelEventCommand(eventId, cancelEventDto.feedback, userId),
    );
  }

  @ApiOperation({ description: 'Update an Event' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'Event updated successfully',
    type: Events,
  })
  @ApiBody({ type: AdminUpdateEventsDto })
  @Permissions('view:Event')
  @UseGuards(UniversalAuthGuard, PermissionsGuard)
  @Patch(':id/update-event-by-admin')
  async updateEvent(
    @Param('id') eventId: string,
    @Body() adminUpdateEventsDto: AdminUpdateEventsDto,
    @CurrentUserId() user: any,
  ): Promise<Events> {
    const adminId = user.user_id;
    return await this.commandBus.execute(
      new AdminUpdateEventCommand(eventId, adminUpdateEventsDto, adminId),
    );
  }

  @ApiOperation({
    summary: 'Get Participated Events by User',
    description:
      'Returns all events a user has participated in by their user ID, with pagination support.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved participated events.',
    schema: {
      example: [
        { eventId: '1', name: 'Tech Conference', date: '2025-09-10' },
        { eventId: '2', name: 'Music Festival', date: '2025-09-15' },
      ],
    },
  })
  @ApiBearerAuth('access-token')
  @Permissions('view:Event')
  @UseGuards(UniversalAuthGuard, PermissionsGuard)
  @HttpCode(200)
  @Get('users/:userId/participated-events')
  async getParticipatedEvents(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const query = new GetParticipatedEventsQuery(
      userId,
      Number(page),
      Number(limit),
    );
    return await this.queryBus.execute(query);
  }
}
