import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Events } from 'src/domain/entities/events.entity';
import { CreateEventsDto } from 'src/presentation/dtos/events/create-events.dto';
import { UpdateEventsDto } from 'src/presentation/dtos/events/update-events.dto';


@Injectable()
export class EventsProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CreateEventsDto,
        Events,
        forMember(
          (destination) => destination.title,
          mapFrom((src) => src.title),
        ),
        forMember(
          (destination) => destination.description,
          mapFrom((src) => src.description),
        ),
        forMember(
          (destination) => destination.location,
          mapFrom((src) => src.location),
        ),

        forMember(
          (destination) => destination.latitude,
          mapFrom((src) => src.latitude),
        ),


        forMember(
          (destination) => destination.longitude,
          mapFrom((src) => src.longitude),
        ),

        
        forMember(
          (destination) => destination.category,
          mapFrom((src) => src.category),
        ),

        forMember(
          (destination) => destination.privacy,
          mapFrom((src) => src.privacy),
        ),

        forMember(
          (destination) => destination.event_start_date,
          mapFrom((src) => src.event_start_date),
        ),

        forMember(
          (destination) => destination.event_end_date,
          mapFrom((src) => src.event_end_date),
        ),
        forMember(
          (destination) => destination.bank_accounts,
          mapFrom((source) => source.bank_accounts),
        ),
      );


      createMap(
        mapper,
        UpdateEventsDto,
        Events,
        forMember(
          (destination) => destination.title,
          mapFrom((src) => src.title),
        ),
        forMember(
          (destination) => destination.description,
          mapFrom((src) => src.description),
        ),
        forMember(
          (destination) => destination.location,
          mapFrom((src) => src.location),
        ),


        forMember(
          (destination) => destination.latitude,
          mapFrom((src) => src.latitude),
        ),

        forMember(
          (destination) => destination.longitude,
          mapFrom((src) => src.longitude),
        ),
        forMember(
          (destination) => destination.category,
          mapFrom((src) => src.category),
        ),

        forMember(
          (destination) => destination.privacy,
          mapFrom((src) => src.privacy),
        ),

        forMember(
          (destination) => destination.event_start_date,
          mapFrom((src) => src.event_start_date),
        ),

        forMember(
          (destination) => destination.event_end_date,
          mapFrom((src) => src.event_end_date),
        ),
      );
    };
  }
}
