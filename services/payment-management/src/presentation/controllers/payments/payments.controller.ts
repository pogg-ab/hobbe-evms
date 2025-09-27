import { Controller, Get, Post, Param, Body, HttpCode, UseInterceptors, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { GetAmountsOwedToOrganizersQuery } from 'src/application/queries/payments/get-amounts-owed-to-organizers.query';
import { GetPaymentsQuery } from 'src/application/queries/payments/get-payments.query';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { GetPaymentsDto } from 'src/presentation/dtos/payments/get-payments.dto';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/presentation/guards/permissions.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';
import { UniversalAuthGuard } from 'src/presentation/guards/universal-auth.guard';

@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly queryBus: QueryBus,
        // private readonly commandBus: CommandBus,
    ) {}
    
    @Post()
    @HttpCode(200)
    @ApiOperation({ summary: 'View all payments of Organizers)' })
    @ApiResponse({ status: 200, description: 'List of payments retrieved successfully by organizer.' })
    @ApiResponse({ status: 500, description: 'Internal Server Error.' })
    @ApiBearerAuth('access-token')
    @UseGuards(UniversalAuthGuard, PermissionsGuard)
    async getAllPayments(@Body() dto?: GetPaymentsDto) {
       return await this.queryBus.execute(new GetPaymentsQuery(dto));
    }


@Post('organizer')
@HttpCode(200)
@ApiOperation({ summary: 'View all My payments' })
@ApiResponse({ status: 200, description: 'List of payments retrieved successfully.' })
@ApiResponse({ status: 500, description: 'Internal Server Error.' })
@ApiBody({
  description: 'Filter payments by event ID and status',
  schema: {
    type: 'object',
    properties: {
      eventId: { type: 'string', format: 'uuid' },
      status: { type: 'string' },
    },
    example: {
      eventId: '849b4dda-fc2b-452d-bc12-e8dd0bc8b6f3',
      status: 'Pending',
    },
  },
})
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
async getMyPayments(
  @Body() body: { eventId: string; },
  @CurrentUserId() user: any,
) {
  const { eventId } = body;

  return this.queryBus.execute(
    new GetPaymentsQuery({
      eventId,
      userId: user.userId.toString(),
    //   status,
    }),
  );
}



   


    // Track amounts owed to each event organizer.

    @Get('organizer-amounts-owed')
    @HttpCode(200)
    @ApiOperation({ summary: 'Track amounts owed to each event organizer.' })
    @ApiResponse({ status: 500, description: 'Internal Server Error.' })
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getAmountsOwedToOrganizers(
        @CurrentUserId() user: any,
    ) {
       
       return await this.queryBus.execute(new GetAmountsOwedToOrganizersQuery(user.userId.toString()));
    }

}
