import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';
import { FilterGuestListQuery } from 'src/application/queries/guest/filter-guest-list.query';
import { FilterGuestListDto } from 'src/presentation/dtos/guest/filter-guest-list.dto';

@ApiTags('Guests')
@Controller('guests')
export class GuestController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Retrieve guests with purchased tickets',
    description:
      'Returns a filtered and sorted list of participants who have purchased tickets.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of participants with purchased tickets.',
  })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/booking/purchased')
  async getBookingPurchasedParticipants(
    @Query() query: FilterGuestListDto,
  ): Promise<{ participants: ParticipantHasTicket[] | null }> {
    return this.queryBus.execute(new FilterGuestListQuery('purchased', query));
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
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/booking/arrived')
  async getBookingArrivedParticipants(
    @Query() query: FilterGuestListDto,
  ): Promise<{ participants: ParticipantHasTicket[] | null }> {
    return this.queryBus.execute(new FilterGuestListQuery('arrived', query));
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
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/booking/canceled')
  async getBookingCanceledParticipants(
    @Query() query: FilterGuestListDto,
  ): Promise<{ participants: ParticipantHasTicket[] | null }> {
    return this.queryBus.execute(new FilterGuestListQuery('canceled', query));
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
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/booking/gifted')
  async getBookingGiftedParticipants(
    @Query() query: FilterGuestListDto,
  ): Promise<{ participants: ParticipantHasTicket[] | null }> {
    return this.queryBus.execute(new FilterGuestListQuery('gifted', query));
  }
}
