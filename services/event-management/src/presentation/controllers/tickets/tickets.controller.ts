import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetEventsByIdQuery } from 'src/application/queries/events/get-events-by-id.query';
import { FindTicketByHeadingQuery } from 'src/application/queries/tickets/find-all-tickets-by-heading.query';
import { GetAllTicketsQuery } from 'src/application/queries/tickets/get-all-tickets.query';
import { GetUserTicketsQuery } from 'src/application/queries/tickets/get-user-tickets.query';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { TicketsStatusOV } from 'src/domain/value-objects/tickets-status.value-object';
import { TicketsTypeOV } from 'src/domain/value-objects/tickets.type.value-object';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';

@Controller('tickets')
@ApiTags('Tickets')
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

  @ApiOperation({ description: 'Get Tickets for Upcoming Events for the User' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/upcoming')
  async getUpcomingTickets(
    @CurrentUserId() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{
    ticketsList: Tickets[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    console.log(user)
    return this.queryBus.execute(new GetUserTicketsQuery(page, limit, user.user.user_id.toString(), 'upcoming'));
  }

  @ApiOperation({ description: 'Get Tickets for Past Events for the User' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/past')
  async getPastTickets(
    @CurrentUserId() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{
    ticketsList: Tickets[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    return this.queryBus.execute(new GetUserTicketsQuery(page, limit, user.user.user_id.toString(), 'past'));
  }

  @ApiOperation({ description: 'Get Tickets Gifted to the User' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/gifted')
  async getGiftedTickets(
    @CurrentUserId() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{
    ticketsList: Tickets[] | null;
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
    const ticket_heading_id = event.ticket.id;
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

}
