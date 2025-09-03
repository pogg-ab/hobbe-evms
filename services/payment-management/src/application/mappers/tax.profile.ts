import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Tax } from 'src/domain/entities/tax.entity';
import { CreateTaxDto, UpdateTaxDto } from 'src/presentation/dtos/tax/tax.dto';

@Injectable()
export class TaxProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            createMap(
                mapper,
                CreateTaxDto,
                Tax,
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
                UpdateTaxDto,
                Tax,
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