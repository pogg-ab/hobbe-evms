import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Events } from 'src/domain/entities/events.entity';
import { TicketsList } from 'src/domain/entities/tickets_list.entity';
import { UpdateEventsDto } from 'src/presentation/dtos/events/update-events.dto';
import { CreateTicketsListDto } from 'src/presentation/dtos/tickets/create-tickets-list.dto';



@Injectable()
export class TicktesListProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CreateTicketsListDto,
        TicketsList,
        forMember(
          (destination) => destination.discount,
          mapFrom((src) => src.discount),
        ),


        forMember(
          (destination) => destination.price,
          mapFrom((src) => src.price),
        ),


        forMember(
          (destination) => destination.type,
          mapFrom((src) => src.type),
        ),

        forMember(
            (destination) => destination.ticket_id,
            mapFrom((src) => src.ticket_id),
          ),
      );

    };
  }
}
