import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { log } from 'console';
import { Request } from 'express';
import { QrCodeLogAfterScannedCommand } from 'src/application/commands/qr-code/qr-code-log-after-scanned.command ';
import { QrCodeScannedLogCommand } from 'src/application/commands/qr-code/qr-scanned-log.command';
import { GetEventsByIdQuery } from 'src/application/queries/events/get-events-by-id.query';
import { QrScannedAggregateQuery } from 'src/application/queries/qr-code/aggregate-qr-code-scanned-logs.query.';
import { CountQrCodeScannedLogsQuery } from 'src/application/queries/qr-code/count-qr-code-scanned-logs.query';
import { QrAfterScannedActionsAggregateQuery } from 'src/application/queries/qr-code/qr-code-actions-ater-scanned.query';
import { FindTicketByHeadingQuery } from 'src/application/queries/tickets/find-all-tickets-by-heading.query';
import { FindOneQuery } from 'src/application/queries/tickets/find-one.query';
import { GetAllTicketsQuery } from 'src/application/queries/tickets/get-all-tickets.query';
import { GetUserTicketsQuery } from 'src/application/queries/tickets/get-user-tickets.query';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { TicketsStatusOV } from 'src/domain/value-objects/tickets-status.value-object';
import { TicketsTypeOV } from 'src/domain/value-objects/tickets.type.value-object';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { QrCodeActionAfterScannedDto } from 'src/presentation/dtos/qr-code/qr-code-action-after-scanned.dto';
import { QrAfterScannedActionsAggregateDto } from 'src/presentation/dtos/qr-code/qr-scaned-after-scanned-action-aggregate.dto';
import { QrScannedAggregateDto } from 'src/presentation/dtos/qr-code/qr-scaned-aggregate.dto';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';


@Controller('tickets')
@ApiTags('Tickets')
@ApiBearerAuth('access-token')
export class TicketsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  // @ApiBody({type: CreateTicketsListDto})
  // @ApiOperation({description:'Create Tickets List'})
  // @HttpCode(200)
  // @ApiResponse({ type:CreateTicketsListDto})
  // @Post(":ticket_id")
  // async createTickets(@Body() createTicketsListDto:CreateTicketsListDto):Promise<TicketsList>{
  //     const command = new CreateTicketsListCommand(createTicketsListDto);
  //     const createTicket = await this.commandBus.execute(command);
  //     return createTicket;
  // }

  @ApiOperation({ description: 'Get All Tickets' })
  @HttpCode(200)
  // @Roles('User')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{
    ticketsList: Tickets[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    return this.queryBus.execute(new GetAllTicketsQuery(page, limit));
  }

  @ApiOperation({ description: 'Find Tickets By ID' })
  @HttpCode(200)
  @Get('/:id')
  async findOne(@Param('id') id: string): Promise<{
    ticketsList: Tickets | null;
  }> {
    return this.queryBus.execute(new FindOneQuery(id));
  }

  @ApiOperation({ description: 'Get Tickets for Upcoming Events for the User' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/event/upcoming')
  async getUpcomingTickets(
    @CurrentUserId() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{
    ticketsList: Tickets[] | null;
    groupedTickets: any
    total: number;
    page: number;
    limit: number;
  }> {
    return this.queryBus.execute(new GetUserTicketsQuery(page, limit, user.user.user_id.toString(), 'upcoming'));
  }

  @ApiOperation({ description: 'Get Tickets for Past Events for the User' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/event/past')
  async getPastTickets(
    @CurrentUserId() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{
    ticketsList: Tickets[] | null;
    groupedTickets: any
    total: number;
    page: number;
    limit: number;
  }> {
    return this.queryBus.execute(new GetUserTicketsQuery(page, limit, user.user.user_id.toString(), 'past'));
  }

  @ApiOperation({ description: 'Get Tickets Gifted to the User' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/event/gifted')
  async getGiftedTickets(
    @CurrentUserId() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{
    ticketsList: Tickets[] | null;
    groupedTickets: any
    total: number;
    page: number;
    limit: number;
  }> {
    return this.queryBus.execute(new GetUserTicketsQuery(page, limit, user.user.user_id.toString(), 'gifted'));
  }


  @ApiOperation({ description: 'Get All Tickets Of Per Event' })
  @HttpCode(200)
  // @Roles('User')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("/events/:event_id")
  async findAllByEvent(
    @Param("event_id") event_id: string,
  ): Promise<{
    tickets: Tickets[] | null;

  }> {
    const event = await this.queryBus.execute(new GetEventsByIdQuery(event_id));
    const ticket_heading_id = event.ticket_heading.id;
    return await this.queryBus.execute(new FindTicketByHeadingQuery(ticket_heading_id));
  }

  @ApiOperation({ description: 'Get All Tickets Of Per Event And Type' })
  @HttpCode(200)
  // @Roles('User')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("/:event_id/:type")
  async findAllByEventAndTicketsType(
    @Param("event_id") event_id: string,
    @Param("type") type: string,
  ): Promise<{
    tickets: Tickets[] | null;

  }> {
    // Validate tickets_type against the TicketsType enum
    if (!Object.values(TicketsTypeOV).includes(type as TicketsTypeOV)) {
      throw new BadRequestException(
        `Invalid type: ${type}. Allowed values are: ${Object.values(TicketsTypeOV).join(', ')}`
      );
    }
    const event = await this.queryBus.execute(new GetEventsByIdQuery(event_id));
    const ticket_heading_id = event.ticket.id;
    return await this.queryBus.execute(new FindTicketByHeadingQuery(ticket_heading_id, type, ''));
  }


  @ApiOperation({ description: 'Get All Tickets Of Per Event And Status' })
  @HttpCode(200)
  // @Roles('User')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("get-by-status/:event_id/:status")
  async findAllByEventAndTicketsStatus(
    @Param("event_id") event_id: string,
    @Param("status") status: string,
  ): Promise<{
    tickets: Tickets[] | null;

  }> {
    // Validate tickets_type against the TicketsType enum
    if (!Object.values(TicketsStatusOV).includes(status as TicketsStatusOV)) {
      throw new BadRequestException(
        `Invalid ststus: ${status}. Allowed values are: ${Object.values(TicketsStatusOV).join(', ')}`
      );
    }
    const event = await this.queryBus.execute(new GetEventsByIdQuery(event_id));
    const ticket_heading_id = event.ticket.id;
    return await this.queryBus.execute(new FindTicketByHeadingQuery(ticket_heading_id, '', status));
  }



  @ApiOperation({ description: 'Get All Tickets Of Per Event' })
  @HttpCode(200)
  // @Roles('User')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("/tickets-heading/:ticket_heading_id")
  async findAllByTicketHeading(
    @Param("ticket_heading_id") ticket_heading_id: string,
    // @Query('page') page = 1,
    // @Query('limit') limit = 10,
  ): Promise<{
    tickets: Tickets[] | null;
    // total: number;
    // page: number;
    // limit: number;
  }> {
    return this.queryBus.execute(new FindTicketByHeadingQuery(ticket_heading_id));
  }


  @Get('get/ticket-info/:ticket_id')
  @ApiOperation({ description: 'Get Tickets Info By ID' })
  @ApiParam({ name: 'ticket_id', required: true, description: 'Ticket ID' })
  @HttpCode(200)
  async getTicketsInfoById(
    @Param('ticket_id') ticket_id: string,
    @Req() req: Request,
  ): Promise<any> {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const metadata = JSON.stringify({ ip, userAgent });
    await this.commandBus.execute(new QrCodeScannedLogCommand(ticket_id, metadata));

    return (` Deep or APP Link or Web view will present event detail information  `)
  }


  // lets store the QR code scanned log
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('User')
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'QR code scanned log created successfully.' })

  @ApiOperation({ description: 'Log QR Code Scanned' })
  @ApiParam({ name: 'ticket_no', required: true, description: 'Ticket Number' })
  @Post('log/qr-code-scanned/:ticket_no')
  async logQrCodeScanned(
    @Param('ticket_no') ticket_no: string,
    @Req() req: Request,
  ): Promise<string> {

    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const metadata = JSON.stringify({ ip, userAgent });
    await this.commandBus.execute(new QrCodeScannedLogCommand(ticket_no, metadata));

    return await this.commandBus.execute(new QrCodeScannedLogCommand(ticket_no, metadata));
  }


  // update the QR code scanned log after scan taken action, we gonna update the action_taken_after_scan field only
  @Patch('qr-action-log-after-scanned/:qrcode_scan_log_id')
  @ApiOperation({ description: 'Update QR Code Scanned Log After Scan Action Taken' })
  @ApiBody({ type: QrCodeActionAfterScannedDto })
  @ApiResponse({ status: 200, description: 'QR code scanned log updated successfully.' })
  async qrCodeLogAfterScanned(@Body() dto:QrCodeActionAfterScannedDto ): Promise<any> {
    const command = new QrCodeLogAfterScannedCommand(dto);
    return await this.commandBus.execute(command);
  } 


  // As an analyst, I want to monitor user follow-up actions after QR scans (e.g., link clicks, signups). group by action_taken_after_scan with in date range
  @Post('qr-code-actions-after-scanned')
  @ApiOperation({ description: 'Get QR Code Actions After Scanned' })
  @ApiBody({ type: QrScannedAggregateDto })
  @ApiResponse({ status: 200, description: 'QR code actions after scanned retrieved successfully.' })
  async getQrCodeActionsAfterScanned(
    @Body() dto: QrAfterScannedActionsAggregateDto,
  ): Promise<any> {
    const { startDate, endDate, aggregateType } = dto;
    if (!startDate || !endDate || !aggregateType) {
      throw new BadRequestException('Start date, end date, and aggregate type are required.');
    }
    if (!['day', 'week', 'month', 'year'].includes(aggregateType)) {
      throw new BadRequestException('Invalid aggregate type. Allowed values are: day, week, month, year.');
    }

    if (startDate > endDate) {
      throw new BadRequestException('Start date cannot be after end date.');
    }
    
    const query = new QrAfterScannedActionsAggregateQuery(dto);
    return await this.queryBus.execute(query);
  }




 


  @Get('count/qr-code-scanned/:event_id')
  @ApiOperation({ description: 'Count QR Code Scanned Logs by Event ID' })
  @ApiParam({ name: 'event_id', required: true, description: 'Event ID' })
  @HttpCode(200)
  async countQrCodeScannedLogs(
    @Param('event_id') event_id: string,
  ): Promise<any> {
    // Assuming you have a method in your service to count the logs
    const qrCodeScannedLog = await this.queryBus.execute(new CountQrCodeScannedLogsQuery(event_id));
    return qrCodeScannedLog;
   }

  

  @Post('aggregate/qr-code-scanned')
  @ApiOperation({ description: 'Aggregate QR Code Scanned Logs' })
  @ApiBody({ type: QrScannedAggregateDto })
  @ApiResponse({ status: 200, description: 'QR code scanned logs aggregated successfully.' })
  async aggregateQrCodeScannedLogs(
    @Body() dto: QrScannedAggregateDto,
  ): Promise<any> {
    const { startDate, endDate, aggregateType } = dto;
    if (!startDate || !endDate || !aggregateType) {
      throw new BadRequestException('Start date, end date, and aggregate type are required.');
    }
    if (!['day', 'week', 'month', 'year'].includes(aggregateType)) {
      throw new BadRequestException('Invalid aggregate type. Allowed values are: day, week, month, year.');
    }

    if (startDate > endDate) {
      throw new BadRequestException('Start date cannot be after end date.');
    }
    // Logic to aggregate the scanned logs based on the provided parameters lets  create query object
    const query = new QrScannedAggregateQuery(dto);
    const aggregatedLogs = await this.queryBus.execute(query);
    return aggregatedLogs;
  }
}
