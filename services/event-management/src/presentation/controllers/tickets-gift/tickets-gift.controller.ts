import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CancelTicketGiftsCommand } from 'src/application/commands/ticket-gifts/cancel-ticket-gifts.command';
import { GetAllReceivedGiftsQuery } from 'src/application/queries/tickets-gift/get-received-gift-tickets.query';
import { GetAllSentGiftsQuery } from 'src/application/queries/tickets-gift/get-sent-gift-tickets.query';

import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';

@ApiTags('Tickets Gift')
@Controller('tickets-gift')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class TicketsGiftController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('sent')
  @ApiOperation({ summary: 'Get all sent gift tickets' })
  @ApiResponse({ status: 200, description: 'List of sent gift tickets.' })
  @HttpCode(200)
  async getAllGifts(@CurrentUserId() user: any) {
    return await this.queryBus.execute(
      new GetAllSentGiftsQuery(user.user.user_id.toString()),
    );
  }

  @Get('received')
  @ApiOperation({ summary: 'Get all received gift tickets' })
  @ApiResponse({ status: 200, description: 'List of received gift tickets.' })
  @HttpCode(200)
  async getAllReceivedGifts(@CurrentUserId() user: any) {
    return await this.queryBus.execute(
      new GetAllReceivedGiftsQuery(user.user.user_id.toString()),
    );
  }

  @Post('change-recipient')
  @ApiOperation({ summary: 'change-recipient of gifted ticket' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        giftId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        newRecipientId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Gift ticket cancelled successfully.',
  })
  @HttpCode(200)
  async changeRecipient(
    @CurrentUserId() user: any,
    @Body('giftId') giftId: string,
    @Body('newRecipientId') newRecipientId: string,
  ) {
    return await this.commandBus.execute(
      new CancelTicketGiftsCommand(
        giftId,
        user.user.user_id.toString(),
        newRecipientId,
      ),
    );
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel a gift ticket' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        giftId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Gift ticket cancelled successfully.',
  })
  @HttpCode(200)
  async cancelGift(@CurrentUserId() user: any, @Body('giftId') giftId: string) {
    return await this.commandBus.execute(
      new CancelTicketGiftsCommand(giftId, user.user.user_id.toString()),
    );
  }
}
