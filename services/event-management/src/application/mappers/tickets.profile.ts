import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Events } from 'src/domain/entities/events.entity';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { UpdateEventsDto } from 'src/presentation/dtos/events/update-events.dto';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';

@Injectable()
export class TicktesProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CreateTicketsDto,
        Tickets,
       

        forMember(
          (destination) => destination.price,
          mapFrom((src) => src.price),
        ),

        forMember(
          (destination) => destination.type,
          mapFrom((src) => src.type),
        ),

        forMember(
          (destination) => destination.qr_code,
          mapFrom((src) => src.qr_code),
        ),

        forMember(
          (destination) => destination.ticket_no,
          mapFrom((src) => src.ticket_no),
        ),

        forMember(
          (destination) => destination.ticket_heading_id,
          mapFrom((src) => src.ticket_heading_id),
        ),
        forMember(
          (destination) => destination.event_id,
          mapFrom((src) => src.event_id),
        ),


      );
    };
  }
}
