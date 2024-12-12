import {
  Controller,
  Get,
  HttpCode,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { FindTicketsByIdQuery } from 'src/application/queries/tickets/find-tickets-by-id.query';
import { GetAllTicketsQuery } from 'src/application/queries/tickets/get-all-tickets.query';
import { GetEventsAllTicketsListCommand } from 'src/application/queries/tickets/get-events-all-ticketslist.query';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';

@Controller('tickets')
@ApiTags('Tickets')
export class TicketsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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

  @ApiOperation({ description: 'Get All Tickets In Single Ticket-Heading' })
  @ApiParam({
    name: 'ticket_id',
    description: 'The unique ID of the ticket',
    required: true,
    type: String, // Or 'Number' based on the ID type
  })
  @HttpCode(200)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('Tickets-Head/:id')
  async getAll(
    @Param('id') ticket_id: IdValueObject,
  ): Promise<Tickets[] | null> {
    return this.queryBus.execute(new GetEventsAllTicketsListCommand(ticket_id));
  }

  @ApiOperation({ description: 'Find Tickets By ID' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the ticket',
    required: true,
    type: String, // Or 'Number' based on the ID type
  })
  @HttpCode(200)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Tickets | null> {
    console.log(id);

    return this.queryBus.execute(new FindTicketsByIdQuery(id));
  }
}
