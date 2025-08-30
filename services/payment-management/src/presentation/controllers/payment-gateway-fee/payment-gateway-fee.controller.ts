import { Controller, Post, Get, Patch, Delete, Body, Param, Query, HttpCode, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Permissions } from 'src/presentation/decorators/permissions.decorator';
import { UniversalAuthGuard } from 'src/presentation/guards/universal-auth.guard';
import { PermissionsGuard } from 'src/presentation/guards/permissions.guard';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { CreatePaymentGatewayFeeDto, UpdatePaymentGatewayFeeDto } from 'src/presentation/dtos/payment-gateway-fee/payment-gateway-fee.dto';
import { CreatePaymentGatewayFeeCommand } from 'src/application/commands/payment-gateway-fee/create-payment-gateway-fee.command';
import { UpdatePaymentGatewayFeeCommand } from 'src/application/commands/payment-gateway-fee/update-payment-gateway-fee.command';
import { DeletePaymentGatewayFeeCommand } from 'src/application/commands/payment-gateway-fee/delete-payment-gateway-fee.command';
import { GetPaymentGatewayFeeByIdQuery } from 'src/application/queries/payment-gateway-fee/get-payment-gateway-fee-by-id.query';
import { GetAllPaymentGatewayFeesQuery } from 'src/application/queries/payment-gateway-fee/get-all-payment-gateway-fees.query';
import { PaymentGatewayFee } from 'src/domain/entities/payment-gateway-fee.entity';
import { PaymentGatewayFeeIdValueObject } from 'src/domain/value-objects/payment-gateway-fee-id.value-object';

@ApiTags('Payment Gateway Fees')
@Controller('payment-gateway-fees')
export class PaymentGatewayFeeController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    @ApiOperation({ description: 'Create a new payment gateway fee record' })
    @HttpCode(201)
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: 'Payment gateway fee record created successfully',
        type: PaymentGatewayFee,
    })
    @ApiBody({ type: CreatePaymentGatewayFeeDto })
    @Permissions('manage:PaymentGatewayFee')
    @UseGuards(UniversalAuthGuard, PermissionsGuard)
    @Post()
    async createPaymentGatewayFee(
        @Body() createPaymentGatewayFeeDto: CreatePaymentGatewayFeeDto,
        @CurrentUserId() user: any,
    ): Promise<PaymentGatewayFee> {
        const userId = user.user.user_id.toString();
        return await this.commandBus.execute(
            new CreatePaymentGatewayFeeCommand(createPaymentGatewayFeeDto, userId),
        );
    }

    @ApiOperation({ description: 'Get a payment gateway fee record by ID' })
    @HttpCode(200)
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: 'Payment gateway fee record retrieved successfully',
        type: PaymentGatewayFee,
    })
    @Permissions('manage:PaymentGatewayFee')
    @UseGuards(UniversalAuthGuard, PermissionsGuard)
    @Get(':id')
    async getPaymentGatewayFeeById(@Param('id') id: string): Promise<PaymentGatewayFee> {
        const paymentGatewayFeeId = new PaymentGatewayFeeIdValueObject(id);
        return await this.queryBus.execute(new GetPaymentGatewayFeeByIdQuery(paymentGatewayFeeId));
    }

    @ApiOperation({ description: 'Get all payment gateway fee records with pagination' })
    @HttpCode(200)
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: 'Payment gateway fee records retrieved successfully',
    })
    @Permissions('manage:PaymentGatewayFee')
    @UseGuards(UniversalAuthGuard, PermissionsGuard)
    @Get()
    async getAllPaymentGatewayFees(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<{ paymentGatewayFees: PaymentGatewayFee[] | null; total: number; page: number; limit: number; totalPages: number }> {
        return await this.queryBus.execute(new GetAllPaymentGatewayFeesQuery(page, limit));
    }

    @ApiOperation({ description: 'Update a payment gateway fee record' })
    @HttpCode(200)
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: 'Payment gateway fee record updated successfully',
        type: PaymentGatewayFee,
    })
    @ApiBody({ type: UpdatePaymentGatewayFeeDto })
    @Permissions('manage:PaymentGatewayFee')
    @UseGuards(UniversalAuthGuard, PermissionsGuard)
    @Patch(':id')
    async updatePaymentGatewayFee(
        @Param('id') id: string,
        @Body() updatePaymentGatewayFeeDto: UpdatePaymentGatewayFeeDto,
        @CurrentUserId() user: any,
    ): Promise<PaymentGatewayFee> {
        const userId = user.user.user_id.toString();
        const paymentGatewayFeeId = new PaymentGatewayFeeIdValueObject(id);
        return await this.commandBus.execute(
            new UpdatePaymentGatewayFeeCommand(paymentGatewayFeeId, updatePaymentGatewayFeeDto, userId),
        );
    }

    @ApiOperation({ description: 'Delete a payment gateway fee record' })
    @HttpCode(204)
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: 'Payment gateway fee record deleted successfully',
    })
    @Permissions('manage:PaymentGatewayFee')
    @UseGuards(UniversalAuthGuard, PermissionsGuard)
    @Delete(':id')
    async deletePaymentGatewayFee(
        @Param('id') id: string,
        @CurrentUserId() user: any,
    ): Promise<void> {
        const userId = user.user.user_id.toString();
        const paymentGatewayFeeId = new PaymentGatewayFeeIdValueObject(id);
        await this.commandBus.execute(new DeletePaymentGatewayFeeCommand(paymentGatewayFeeId, userId));
    }
}