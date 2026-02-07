import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';
import { FilterGuestListQuery } from 'src/application/queries/guest/filter-guest-list.query';
import { FilterGuestListDto } from 'src/presentation/dtos/guest/filter-guest-list.dto';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { BlockGuestCommand } from 'src/application/commands/guest/block-guest.command';
import { BlockGuestDto } from 'src/presentation/dtos/guest/block-guest.dto';
import { GetBlockedGuestsQuery } from 'src/application/queries/guest/get-blocked-guests.query';
import { UnblockGuestCommand } from 'src/application/commands/guest/unblock-guest.command';
import { UnblockGuestDto } from 'src/presentation/dtos/guest/unblock-guest.dto';

@ApiTags('Guests')
@Controller('guests')
export class GuestController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @ApiOperation({
    summary: 'Retrieve guests with pending tickets',
    description:
      'Returns a filtered and sorted list of participants with pending ticket status.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of participants with pending tickets.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10)',
  })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/booking/pending')
  async getBookingPendingParticipants(
    @CurrentUserId() user: any,
    @Query() query: FilterGuestListDto,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{
    participants: ParticipantHasTicket[] | [];
    page: number;
    limit: number;
    total: number;
  }> {
    if (page < 1) throw new BadRequestException('Page must be greater than 0');
    if (limit < 1 || limit > 100)
      throw new BadRequestException('Limit must be between 1 and 100');

    const organizerId = user.user.user_id.toString();
    return this.queryBus.execute(
      new FilterGuestListQuery('pending', query, organizerId, page, limit),
    );
  }

  @ApiOperation({
    summary: 'Retrieve guests with purchased tickets',
    description:
      'Returns a filtered and sorted list of participants who have purchased tickets.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of participants with purchased tickets.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10)',
  })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/booking/purchased')
  async getBookingPurchasedParticipants(
    @CurrentUserId() user: any,
    @Query() query: FilterGuestListDto,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{
    participants: ParticipantHasTicket[] | [];
    page: number;
    limit: number;
    total: number;
  }> {
    const organizerId = user.user.user_id.toString();
    return this.queryBus.execute(
      new FilterGuestListQuery('purchased', query, organizerId, page, limit),
    );
  }

  @ApiOperation({
    summary: 'Retrieve guests with arrived tickets',
    description:
      'Returns a filtered and sorted list of participants whose tickets have been marked as arrived.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of participants with arrived tickets.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10)',
  })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/booking/arrived')
  async getBookingArrivedParticipants(
    @CurrentUserId() user: any,
    @Query() query: FilterGuestListDto,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{
    participants: ParticipantHasTicket[] | [];
    page: number;
    limit: number;
    total: number;
  }> {
    const organizerId = user.user.user_id.toString();
    return this.queryBus.execute(
      new FilterGuestListQuery('arrived', query, organizerId, page, limit),
    );
  }

  @ApiOperation({
    summary: 'Retrieve guests with canceled tickets',
    description:
      'Returns a filtered and sorted list of participants whose tickets have been canceled.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of participants with canceled tickets.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10)',
  })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/booking/canceled')
  async getBookingCanceledParticipants(
    @CurrentUserId() user: any,
    @Query() query: FilterGuestListDto,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{
    participants: ParticipantHasTicket[] | [];
    page: number;
    limit: number;
    total: number;
  }> {
    const organizerId = user.user.user_id.toString();
    return this.queryBus.execute(
      new FilterGuestListQuery('canceled', query, organizerId, page, limit),
    );
  }

  @ApiOperation({
    summary: 'Retrieve guests with gifted tickets',
    description:
      'Returns a filtered and sorted list of participants who have received gifted tickets.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of participants with gifted tickets.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10)',
  })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/booking/gifted')
  async getBookingGiftedParticipants(
    @CurrentUserId() user: any,
    @Query() query: FilterGuestListDto,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{
    participants: ParticipantHasTicket[] | [];
    page: number;
    limit: number;
    total: number;
  }> {
    const organizerId = user.user.user_id.toString();
    return this.queryBus.execute(
      new FilterGuestListQuery('gifted', query, organizerId, page, limit),
    );
  }
  @Post('/:ticketId/block')
  @ApiOperation({
    summary: 'Block a ticket from attending the event',
    description:
      'Prevents a guest from attending by marking their ticket as blocked.',
  })
  @ApiResponse({ status: 200, description: 'Ticket successfully blocked.' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async blockGuest(
    @CurrentUserId() user: any,
    @Param('ticketId') ticketId: string,
    @Body() blockGuestDto: BlockGuestDto,
  ): Promise<{ message: string }> {
    const organizerId = user.user.user_id.toString();

    await this.commandBus.execute(
      new BlockGuestCommand(
        ticketId,
        organizerId,
        blockGuestDto.eventId,
        blockGuestDto.reason,
      ),
    );

    return { message: 'Ticket successfully blocked.' };
  }

  @Post('/:ticketId/unblock')
  @ApiOperation({
    summary: 'Unblock a ticket',
    description:
      'Allows a previously blocked guest to attend again by removing the block status from their ticket.',
  })
  @ApiResponse({ status: 200, description: 'Ticket successfully unblocked.' })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async unblockGuest(
    @CurrentUserId() user: any,
    @Param('ticketId') ticketId: string,
    @Body() unblockGuestDto: UnblockGuestDto,
  ): Promise<{ message: string }> {
    const organizerId = user.user.user_id.toString();

    await this.commandBus.execute(
      new UnblockGuestCommand(ticketId, organizerId, unblockGuestDto.eventId),
    );
    return { message: 'Ticket successfully unblocked.' };
  }

  @Get('/blocked')
  @ApiOperation({
    summary: 'Get all blocked guests for the organizer',
  })
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getBlockedGuests(@CurrentUserId() user: any): Promise<any[]> {
    const organizerId = user.user.user_id.toString();

    return this.queryBus.execute(new GetBlockedGuestsQuery(organizerId));
  }
}
