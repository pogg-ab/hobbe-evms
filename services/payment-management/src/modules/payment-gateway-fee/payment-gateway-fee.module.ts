import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { PaymentGatewayFee } from 'src/domain/entities/payment-gateway-fee.entity';
import { PaymentGatewayFeeController } from 'src/presentation/controllers/payment-gateway-fee/payment-gateway-fee.controller';
import { PaymentGatewayFeeService } from 'src/application/services/payment-gateway-fee/payment-gateway-fee.service';
import { PaymentGatewayFeeRepositoryImpl } from 'src/infrastructure/persistence/repositories/payment-gateway-fee.repository.impl';
import { CreatePaymentGatewayFeeCommandHandler } from 'src/application/handlers/payment-gateway-fee/create-payment-gateway-fee.command.handler';
import { UpdatePaymentGatewayFeeCommandHandler } from 'src/application/handlers/payment-gateway-fee/update-payment-gateway-fee.command.handler';
import { DeletePaymentGatewayFeeCommandHandler } from 'src/application/handlers/payment-gateway-fee/delete-payment-gateway-fee.command.handler';
import { GetPaymentGatewayFeeByIdQueryHandler } from 'src/application/handlers/payment-gateway-fee/get-payment-gateway-fee-by-id.query.handler';
import { GetAllPaymentGatewayFeesQueryHandler } from 'src/application/handlers/payment-gateway-fee/get-all-payment-gateway-fees.query.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { PAYMENT_GATEWAY_FEE_REPOSITORY_TOKEN } from 'src/domain/repositories/payment-gateway-fee/payment-gateway-fee.repository.token';
import { PaymentGatewayFeeProfile } from 'src/application/mappers/payment-gateway-fee.profile';

@Module({
    imports: [
        TypeOrmModule.forFeature([PaymentGatewayFee]),
        CqrsModule,
        AutomapperModule.forRoot({
            strategyInitializer: classes(),
        }),
    ],
    controllers: [PaymentGatewayFeeController],
    providers: [
        PaymentGatewayFeeService,
        {
            provide: PAYMENT_GATEWAY_FEE_REPOSITORY_TOKEN,
            useClass: PaymentGatewayFeeRepositoryImpl,
        },
        CreatePaymentGatewayFeeCommandHandler,
        UpdatePaymentGatewayFeeCommandHandler,
        DeletePaymentGatewayFeeCommandHandler,
        GetPaymentGatewayFeeByIdQueryHandler,
        GetAllPaymentGatewayFeesQueryHandler,
        PaymentGatewayFeeProfile,
    ],
})
export class PaymentGatewayFeeModule { }