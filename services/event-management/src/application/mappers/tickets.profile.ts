
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Events } from 'src/domain/entities/events.entity';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { TicketsList } from 'src/domain/entities/tickets_list.entity';
import { UpdateEventsDto } from 'src/presentation/dtos/events/update-events.dto';
import { CreateTicketsListDto } from 'src/presentation/dtos/tickets/create-tickets-list.dto';
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
          (destination) => destination.name,
          mapFrom((src) => src.name),
        ),


        forMember(
          (destination) => destination.price,
          mapFrom((src) => src.price),
        ),

        forMember(
            (destination) => destination.quantity,
            mapFrom((src) => src.quantity),
          ),

        forMember(
            (destination) => destination.sales_start,
            mapFrom((src) => src.sales_start),
          ),

          forMember(
            (destination) => destination.sales_end,
            mapFrom((src) => src.sales_end),
          ),
  

        forMember(
          (destination) => destination.description,
          mapFrom((src) => src.description),
        ),

        forMember(
            (destination) => destination.schedule,
            mapFrom((src) => src.schedule),
          ),
        
      );

    };
  }
}
