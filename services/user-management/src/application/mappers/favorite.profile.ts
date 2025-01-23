import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Favorite } from 'src/domain/entities/favorite.entity';
import { CreateFavoriteDto } from 'src/presentation/dtos/create-favorite.dto';

@Injectable()
export class FavoriteProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            createMap(
                mapper,
                CreateFavoriteDto,
                Favorite,
                forMember(
                    (destination) => destination.created_date,
                    mapFrom(() => new Date()), 
                ),
            );
        };
    }
}
