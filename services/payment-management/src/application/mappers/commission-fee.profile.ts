import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CommissionFee } from 'src/domain/entities/commission-fee.entity';
import { CreateCommissionFeeDto, UpdateCommissionFeeDto } from 'src/presentation/dtos/commission-fee/commission-fee.dto';

@Injectable()
export class CommissionFeeProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            createMap(
                mapper,
                CreateCommissionFeeDto,
                CommissionFee,
                forMember(
                    (destination) => destination.organizer_id,
                    mapFrom((src) => src.organizer_id),
                ),
                forMember(
                    (destination) => destination.applies_to_event_type,
                    mapFrom((src) => src.applies_to_event_type),
                ),
                forMember(
                    (destination) => destination.rate,
                    mapFrom((src) => src.rate),
                ),
                forMember(
                    (destination) => destination.effective_date,
                    mapFrom((src) => src.effective_date),
                ),
            );

            createMap(
                mapper,
                UpdateCommissionFeeDto,
                CommissionFee,
                forMember(
                    (destination) => destination.organizer_id,
                    mapFrom((src) => src.organizer_id),
                ),
                forMember(
                    (destination) => destination.applies_to_event_type,
                    mapFrom((src) => src.applies_to_event_type),
                ),
                forMember(
                    (destination) => destination.rate,
                    mapFrom((src) => src.rate),
                ),
                forMember(
                    (destination) => destination.effective_date,
                    mapFrom((src) => src.effective_date),
                ),
            );
        };
    }
}