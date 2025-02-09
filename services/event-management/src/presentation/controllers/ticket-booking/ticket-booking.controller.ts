import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTicketBookingCommand } from 'src/application/commands/ticket/create-ticket-booking.command';
import { DeleteTicketBookingCommand } from 'src/application/commands/ticket/delete-ticket-booking.command';
import { UpdateTicketBookingCommand } from 'src/application/commands/ticket/update-ticket-booking.command';
import { UpdateTicketStatusCommand } from 'src/application/commands/ticket/update-ticket-status.command';
import { FindTicketBookingsByEventOrganizerQuery } from 'src/application/queries/tickets/find-ticket-booking-by-event-organizer.query';
import { FindTicketBookingByEventQuery } from 'src/application/queries/tickets/find-ticket-booking-by-event.query';
import { FindTicketBookingsByTicketBuyerQuery } from 'src/application/queries/tickets/find-ticket-booking-by-ticket-buyer.query';
import { GetAllTicketBookingsQuery } from 'src/application/queries/tickets/get-all-ticket-bookings.query';
import { GetTicketBookingByIdQuery } from 'src/application/queries/tickets/get-ticket-booking-by-id.query';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { CreateTicketBookingDto } from 'src/presentation/dtos/tickets/create-ticket-booking.dto';
import { MarkTicketAsAttendedDto } from 'src/presentation/dtos/tickets/mark-ticket-as-attended.dto';
import { UpdateTicketBookingDto } from 'src/presentation/dtos/tickets/update-ticket-booking.dto';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';

@ApiTags('Ticket Booking')
@Controller('ticket-booking')
export class TicketBookingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @ApiOperation({ description: 'Get All Ticket Bookings' })
  @HttpCode(200)
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{
    ticketBookings: TicketBooking[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    return this.queryBus.execute(new GetAllTicketBookingsQuery(page, limit));
  }

  @ApiBody({ type: CreateTicketBookingDto })
  @ApiOperation({ description: 'Create a new ticket booking' })
  @HttpCode(200)
  @ApiResponse({
    type: CreateTicketBookingDto,
  })
  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async createTicketBooking(
    @Body() createTicketBookingDto: CreateTicketBookingDto,
    @CurrentUserId() user: any,
  ): Promise<{ message: string; ticketBooking: TicketBooking }> {
    const command = new CreateTicketBookingCommand(
      createTicketBookingDto,
      user.user.user_id.toString(),
    );
    const createdTicketBooking = await this.commandBus.execute(command);
    return {
      message: 'Ticket Booking created successfully',
      ticketBooking: createdTicketBooking,
    };
  }

  @ApiOperation({ description: 'Get Ticket Booking By ID' })
  @HttpCode(200)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TicketBooking | null> {
    return this.queryBus.execute(new GetTicketBookingByIdQuery(id));
  }

  @ApiOperation({ description: 'Update Ticket Booking By ID' })
  @HttpCode(200)
  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateTicketBookingDto: UpdateTicketBookingDto,
    @CurrentUserId() user: any,
  ): Promise<TicketBooking> {
    const command = new UpdateTicketBookingCommand(
      id,
      updateTicketBookingDto,
      user.user.user_id.toString(),
    );
    return this.commandBus.execute(command);
  }

  @ApiOperation({ description: 'Delete Ticket Booking By ID' })
  @HttpCode(200)
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string): Promise<void> {
    const command = new DeleteTicketBookingCommand(id);
    await this.commandBus.execute(command);
  }

  @ApiOperation({ description: 'Find Ticket Bookings By Event' })
  @HttpCode(200)
  @Get('event/:eventId')
  async findByEvent(
    @Param('eventId') eventId: string,
  ): Promise<TicketBooking[] | null> {
    return this.queryBus.execute(new FindTicketBookingByEventQuery(eventId));
  }

  @ApiOperation({ description: 'Find Ticket Bookings By Ticket Buyer' })
  @HttpCode(200)
  @Get('ticket-buyer/:ticketBuyerId')
  async findByTicketBuyer(
    @Param('ticketBuyerId') ticketBuyerId: string,
  ): Promise<TicketBooking[] | null> {
    return this.queryBus.execute(
      new FindTicketBookingsByTicketBuyerQuery(ticketBuyerId),
    );
  }

  @ApiOperation({ description: 'Find Ticket Bookings By Event Organizer' })
  @HttpCode(200)
  @Get('event-organizer/:eventOrganizerId')
  async findByEventOrganizer(
    @Param('eventOrganizerId') eventOrganizerId: string,
  ): Promise<TicketBooking[] | null> {
    return this.queryBus.execute(
      new FindTicketBookingsByEventOrganizerQuery(eventOrganizerId),
    );
  }

  @ApiOperation({
    description:
      'Mark a Ticket as Attended. Triggered when the ticket is scanned at the event entrance.',
  })
  @ApiResponse({
    status: 200,
    description: 'The ticket status has been successfully updated to ATTENDED.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example:
            'Ticket successfully marked as ATTENDED (scanned by QRScanner).',
        },
      },
    },
  })
  @HttpCode(200)
  @Patch(':id/attend')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async markTicketAsAttended(
    @Param('id') id: string,
    @Body() markTicketAsAttendedDto: MarkTicketAsAttendedDto,
    @CurrentUserId() user: any,
  ): Promise<{ message: string }> {
    const { scannedBy } = markTicketAsAttendedDto;

    if (!scannedBy) {
      throw new Error(
        'The "scannedBy" field is required. Please provide the system or individual who scanned the ticket.',
      );
    }

    const command = new UpdateTicketStatusCommand(
      id,
      user.user.user_id.toString(),
    );

    await this.commandBus.execute(command);

    return {
      message: `Ticket successfully marked as ATTENDED (scanned by ${scannedBy}).`,
    };
  }
}
