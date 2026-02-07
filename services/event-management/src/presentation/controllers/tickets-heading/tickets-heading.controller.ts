import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdatedTicketHeadingCommand } from 'src/application/commands/ticket/update-ticket-heading.command';
import { FindTicketHeadingByIdQuery } from 'src/application/queries/tickets/find-tickets-heading-by-id.query';
import { GetAllTicketsHeadingQuery } from 'src/application/queries/tickets/get-all-tickets-heading.query';
import { TicketsHeading } from 'src/domain/entities/tickets-heading.entity';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';
import { UpdateTicketsHeadingDto } from 'src/presentation/dtos/tickets/update-tickets-heading.dto';
import { ActivateTicketsByHeadingCommand } from 'src/application/commands/ticket/activate-tickets-by-heading.command';
import { TicketHeadingStatus } from 'src/domain/value-objects/tickets-heading-status.value-object';

@Controller('tickets-heading')
@ApiTags('Tickets-Heading')
export class TicketsHeadingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  @ApiOperation({ description: 'Get All Events Tickets Heading' })
  // @ApiParam()
  @HttpCode(200)
  // @UseGuards(JwtAuthGuard, RolesGuard)
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
    return await this.queryBus.execute(
      new GetAllTicketsHeadingQuery(page, limit),
    );
  }

  @ApiOperation({ description: 'Find Tickets Heading By ID' })
  // @ApiParam()
  @HttpCode(200)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.queryBus.execute(new FindTicketHeadingByIdQuery(id));
  }

  @ApiOperation({ description: 'Activate Tickets By Heading' })
  @HttpCode(200)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/change-status/:id/:status')
  async activateTickets(
    @Param('id') id: string,
    @Param('status')
    status: string,
    @CurrentUserId() user: any,
  ): Promise<{ ticket: TicketsHeading; message: string }> {
    if (
      !Object.values(TicketHeadingStatus).includes(
        status as TicketHeadingStatus,
      )
    ) {
      throw new BadRequestException(
        `Invalid status: ${status}. Allowed values are: ${Object.values(TicketHeadingStatus).join(', ')}`,
      );
    }
    const ticket = await this.commandBus.execute(
      new ActivateTicketsByHeadingCommand(id, status, user),
    );
    return { ticket: ticket, message: 'Ticket Activated...' };
  }

  @ApiOperation({ description: 'Update Tickets Heading' })
  // @ApiParam({type : CreateTicketsHeadingDto})
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTicketsHeadingDto: UpdateTicketsHeadingDto,
    @CurrentUserId() user: any,
  ): Promise<TicketsHeading> {
    const ticket = await this.queryBus.execute(
      new FindTicketHeadingByIdQuery(id),
    );
    if (!ticket) throw new Error('Ticket Heading not found');
    Object.assign(ticket, updateTicketsHeadingDto);
    return this.commandBus.execute(
      new UpdatedTicketHeadingCommand(id, ticket, user.user.user_id.toString()),
    );
  }
}
