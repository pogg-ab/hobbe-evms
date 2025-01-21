import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { SpecialGuest } from 'src/domain/entities/special-guest.entity';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { CreateSpecialGuestDto } from 'src/presentation/dtos/special-guest/create-special-guest.dto';

@Injectable()
export class SpecialGuestProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CreateSpecialGuestDto,
        SpecialGuest,
        forMember(
          (destination) => destination.guest_user_id,
          mapFrom((src) => src.guest_user_id),
        ),
        forMember(
          (destination) => destination.event_id,
          mapFrom((source) => source.event_id),
        ),
        forMember(
          (destination) => destination.invited_at,
          mapFrom(() => new Date().toISOString()),
        ),
        forMember(
          (destination) => destination.status,
          mapFrom(() => 'pending'),
        ),
      );
    };
  }
}
