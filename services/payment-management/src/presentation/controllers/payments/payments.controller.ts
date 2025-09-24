import { Controller, Get, Post, Param, Body, HttpCode, UseInterceptors, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetAmountsOwedToOrganizersQuery } from 'src/application/queries/payments/get-amounts-owed-to-organizers.query';
import { GetPaymentsQuery } from 'src/application/queries/payments/get-payments.query';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { GetPaymentsDto } from 'src/presentation/dtos/payments/get-payments.dto';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';

@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly queryBus: QueryBus,
        // private readonly commandBus: CommandBus,
    ) {}
    
    // get all payments linked to events (ticket purchases, refunds, payouts)
    @Post()
    @HttpCode(200)
    @ApiOperation({ summary: 'View all payments)' })
    @ApiResponse({ status: 200, description: 'List of payments retrieved successfully.' })
    @ApiResponse({ status: 500, description: 'Internal Server Error.' })
    async getAllPayments(@Body() dto?: GetPaymentsDto) {
       return await this.queryBus.execute(new GetPaymentsQuery(dto));
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
