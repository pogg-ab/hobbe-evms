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
import { UpdatedTicketHeadingCommand } from 'src/application/commands/ticket/update-ticket-heading.command';
import { FindTicketHeadingByIdQuery } from 'src/application/queries/tickets/find-tickets-heading-by-id.query';
import { GetAllTicketsHeadingQuery } from 'src/application/queries/tickets/get-all-tickets-heading.query';
import { UpdatedTicketHeadingCommandHandler } from 'src/application/handlers/tickets/update-ticket-heading.handler';
import { TicketsHeading } from 'src/domain/entities/tickets-heading.entity';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { CreateTicketsHeadingDto } from 'src/presentation/dtos/tickets/create-tickets-heading.dto';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';

@Controller('tickets-heading')
@ApiTags('Tickets-Heading')
export class TicketsHeadingController {
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
    tickets: TicketsHeading[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.queryBus.execute(new GetAllTicketsHeadingQuery(page, limit));
  }

  @ApiOperation({ description: 'Find Tickets By ID' })
  // @ApiParam()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.queryBus.execute(new FindTicketHeadingByIdQuery(id));
  }

  @ApiOperation({ description: 'Update Tickets Heading' })
  // @ApiParam({type : CreateTicketsHeadingDto})
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTicket: CreateTicketsHeadingDto,
    @CurrentUserId() user: any, // This decorator will automatically fetch the user ID from the request context
  ): Promise<TicketsHeading> {
    const ticket = await this.queryBus.execute(new FindTicketHeadingByIdQuery(id));
    if (!ticket) throw new Error('Ticket Heading not found');
    Object.assign(ticket, updateTicket);
    return this.commandBus.execute(
      new UpdatedTicketHeadingCommand(id, ticket, user.user.user_id.toString()),
    );
  }
}
