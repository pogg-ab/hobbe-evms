import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { PaymentGatewayFee } from 'src/domain/entities/payment-gateway-fee.entity';
import { CreatePaymentGatewayFeeDto, UpdatePaymentGatewayFeeDto } from 'src/presentation/dtos/payment-gateway-fee/payment-gateway-fee.dto';

@Injectable()
export class PaymentGatewayFeeProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            createMap(
                mapper,
                CreatePaymentGatewayFeeDto,
                PaymentGatewayFee,
                forMember(
                    (destination) => destination.provider_name,
                    mapFrom((src) => src.provider_name),
                ),
                forMember(
                    (destination) => destination.percentage_rate,
                    mapFrom((src) => src.percentage_rate),
                ),
                forMember(
                    (destination) => destination.fixed_fee,
                    mapFrom((src) => src.fixed_fee),
                ),
                forMember(
                    (destination) => destination.effective_date,
                    mapFrom((src) => src.effective_date),
                ),
            );

            createMap(
                mapper,
                UpdatePaymentGatewayFeeDto,
                PaymentGatewayFee,
                forMember(
                    (destination) => destination.provider_name,
                    mapFrom((src) => src.provider_name),
                ),
                forMember(
                    (destination) => destination.percentage_rate,
                    mapFrom((src) => src.percentage_rate),
                ),
                forMember(
                    (destination) => destination.fixed_fee,
                    mapFrom((src) => src.fixed_fee),
                ),
                forMember(
                    (destination) => destination.effective_date,
                    mapFrom((src) => src.effective_date),
                ),
            );
        };
    }
}