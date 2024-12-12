import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateTicketsCommand } from 'src/application/commands/ticket/create-tickets.command';
import { UpdatedTicketHeadingCommand } from 'src/application/commands/ticket/update-ticket-heading.command';
import { FindOneTicketQuery } from 'src/application/queries/tickets/find-one-tickets.query';
import { GetAllTicketsQuery } from 'src/application/queries/tickets/get-all-tickets.query';
import { UpdatedTicketHeadingCommandHandler } from 'src/application/queries/tickets/update-ticket-heading.handler';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';

@Controller('tickets-heading')
@ApiTags('Tickets-Heading')
export class TicketsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  @ApiOperation({ description: 'Get All Events Tickets' })
  // @ApiParam()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ): Promise<{
    tickets: Tickets[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.queryBus.execute(new GetAllTicketsQuery(page, limit));
  }

  @ApiOperation({ description: 'Find Tickets By ID' })
  // @ApiParam()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.queryBus.execute(new FindOneTicketQuery(id));
  }

  @ApiOperation({ description: 'Update Tickets Heading' })
  // @ApiParam({type : CreateTicketsDto})
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTicket: CreateTicketsDto,
    @CurrentUserId() user: any, // This decorator will automatically fetch the user ID from the request context
  ): Promise<Tickets> {
    const ticket = await this.queryBus.execute(new FindOneTicketQuery(id));
    if (!ticket) throw new Error('Ticket Heading not found');
    Object.assign(ticket, updateTicket);
    return this.commandBus.execute(
      new UpdatedTicketHeadingCommand(id, ticket, user.user.user_id.toString()),
    );
  }
}
