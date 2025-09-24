import { Controller, Get, Post, Param, Body, HttpCode, UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetPaymentsQuery } from 'src/application/queries/payments/get-payments.query';
import { GetPaymentsDto } from 'src/presentation/dtos/payments/get-payments.dto';

@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly queryBus: QueryBus,
        // private readonly commandBus: CommandBus,
    ) {}
    
    // get all payments linked to events (ticket purchases, refunds, payouts)
    @Post()
    @HttpCode(200)
    @ApiOperation({ summary: 'View all payments linked to events (ticket purchases, refunds, payouts)' })
    @ApiResponse({ status: 200, description: 'List of payments retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @ApiResponse({ status: 500, description: 'Internal Server Error.' })
    async getAllPayments(@Body() dto: GetPaymentsDto) {
        // check dto and pass to query
        if (dto.eventId === undefined && dto.userId === undefined && dto.status === undefined) {
            throw new Error('At least one filter (eventId, userId, or status) must be provided.');
        }

       return await this.queryBus.execute(new GetPaymentsQuery(dto));
    }

}
