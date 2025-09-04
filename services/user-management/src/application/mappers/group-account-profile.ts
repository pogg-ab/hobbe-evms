import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { GroupAccount } from 'src/domain/entities/group-account.entity';
import { CreateGroupAccountDto } from 'src/presentation/dtos/group-account/create-group-account.dto';
import { UserID } from 'src/domain/value-objects/user-id.value-object';

@Injectable()
export class GroupAccountProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            createMap(
                mapper,
                CreateGroupAccountDto,
                GroupAccount,
                forMember(
                    (destination) => destination.primary_user_id,
                    mapFrom((src) => new UserID(src.primary_user_id)),
                ),
                forMember(
                    (destination) => destination.linked_user_id,
                    mapFrom((src) => new UserID(src.linked_user_id)),
                ),
                forMember(
                    (destination) => destination.created_at,
                    mapFrom(() => new Date()),
                ),
                forMember(
                    (destination) => destination.updated_at,
                    mapFrom(() => new Date()),
                ),

            );
        };
    }
}