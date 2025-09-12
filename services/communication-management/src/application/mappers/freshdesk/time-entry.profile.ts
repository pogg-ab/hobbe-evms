import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { TimeEntry } from 'src/domain/entities/freshdesk/time-entry.entity';
import { CreateTimeEntryDto } from 'src/presentation/dto/freshdesk/time-entry/time-entry.dto';

@Injectable()
export class TimeEntryProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            // CreateTimeEntryDto -> TimeEntry
            createMap(
                mapper,
                CreateTimeEntryDto,
                TimeEntry,
                forMember(
                    (destination) => destination.agentId,
                    mapFrom((src) => src.agentId),
                ),
                forMember(
                    (destination) => destination.note,
                    mapFrom((src) => src.note),
                ),
                forMember(
                    (destination) => destination.timeSpent,
                    mapFrom((src) => src.timeSpent),
                ),
                forMember(
                    (destination) => destination.executedAt,
                    mapFrom((src) => src.executedAt ? new Date(src.executedAt) : new Date()),
                ),
                forMember(
                    (destination) => destination.createdAt,
                    mapFrom(() => new Date()),
                ),
                forMember(
                    (destination) => destination.updatedAt,
                    mapFrom(() => new Date()),
                ),
            );

        };
    }
}