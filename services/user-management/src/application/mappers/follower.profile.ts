import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Follower } from 'src/domain/entities/follower.entity';
import { CreateFollowDto } from 'src/presentation/dtos/create-follow.dto';
import { User } from 'src/domain/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FollowerProfile extends AutomapperProfile {
    constructor(
        @InjectMapper() mapper: Mapper,

    ) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            createMap(
                mapper,
                CreateFollowDto,
                Follower,
                forMember(
                    (destination) => destination.status,
                    mapFrom((src) => src.status || 'PENDING'),
                ),
                forMember(
                    (destination) => destination.is_mutual,
                    mapFrom((src) => src.is_mutual || false),
                ),
                forMember(
                    (destination) => destination.created_date,
                    mapFrom(() => new Date()),
                ),
                forMember(
                    (destination) => destination.updated_date,
                    mapFrom(() => new Date()),
                ),
            );
        };
    }

}
