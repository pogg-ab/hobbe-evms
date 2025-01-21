import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { EventSponsor } from 'src/domain/entities/event-sponsor.entity';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { CreateEventSponsorDto } from 'src/presentation/dtos/event-sponsor/create-event-sponsor.dto';

@Injectable()
export class EventSponsorProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CreateEventSponsorDto,
        EventSponsor,
        forMember(
          (destination) => destination.event_sponsor_id,
          mapFrom((src) => new IdValueObject(src.sponsor_user_id)),
        ),
        forMember(
          (destination) => destination.event_id,
          mapFrom((source) => source.event_id),
        ),
      );
    };
  }
}
