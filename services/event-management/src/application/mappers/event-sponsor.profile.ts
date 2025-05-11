import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { EventSponsor, SponsorshipType } from 'src/domain/entities/event-sponsor.entity';
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
          (destination) => destination.sponsor_user_id,
          mapFrom((src) => src.sponsor_user_id[0]),
        ),
        forMember(
          (destination) => destination.event_id,
          mapFrom((source) => source.event_id),
        ),
        forMember(
          (destination) => destination.sponsorship_type,
          mapFrom((source) => SponsorshipType[source.sponsorship_type.toUpperCase()]),
        ),
      );
    };
  }
}
