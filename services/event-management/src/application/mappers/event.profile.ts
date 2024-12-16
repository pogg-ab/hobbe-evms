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
          (destination) => destination.isPaid,
          mapFrom((src) => src.isPaid),
        ),

        forMember(
          (destination) => destination.hasPromocode,
          mapFrom((src) => src.hasPromocode),
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
          (destination) => destination.categories,
          mapFrom((src) => src.categories),
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
          (destination) => destination.ticket_heading,
          mapFrom((source) => source.ticket_heading,
         )
        ),

        forMember(
          (destination) => destination.promocodes,
          mapFrom((source) => source.promocodes,
         )
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
          (destination) => destination.isPaid,
          mapFrom((src) => src.isPaid),
        ),

        forMember(
          (destination) => destination.hasPromocode,
          mapFrom((src) => src.hasPromocode),
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
          (destination) => destination.categories,
          mapFrom((src) => src.categories),
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





          // Mapping TicketsList to itself
          // createMap(
          //   mapper,
          //   TicketsList,
          //   TicketsList,
          //   forMember(
          //     (destination) => destination.id,
          //     mapFrom((src) => src.id),
          //   ),
          //   forMember(
          //     (destination) => destination.type,
          //     mapFrom((src) => src.type),
          //   ),
          //   forMember(
          //     (destination) => destination.discount,
          //     mapFrom((src) => src.discount),
          //   ),

          //   forMember(
          //     (destination) => destination.max_order,
          //     mapFrom((src) => src.max_order),
          //   ),
          //   forMember(
          //     (destination) => destination.min_order,
          //     mapFrom((src) => src.min_order),
          //   ),
          //   forMember(
          //     (destination) => destination.price,
          //     mapFrom((src) => src.price),
          //   ),
          //   forMember(
          //     (destination) => destination.promo_code,
          //     mapFrom((src) => src.promo_code),
          //   ),

          //   forMember(
          //     (destination) => destination.quantity,
          //     mapFrom((src) => src.quantity),
          //   ),
          //   forMember(
          //     (destination) => destination.status,
          //     mapFrom((src) => src.status),
          //   ),

          //   forMember(
          //     (destination) => destination.ticket_id,
          //     mapFrom((src) => src.ticket_id),
          //   ),
          // );

          // createMap(
          //   mapper,
          //   Tickets,
          //   Tickets,
          //   forMember(
          //     (destination) => destination.id,
          //     mapFrom((src) => src.id),
          //   ),
          //   forMember(
          //     (destination) => destination.created_at,
          //     mapFrom((src) => src.created_at),
          //   ),
          //   forMember(
          //     (destination) => destination.created_by,
          //     mapFrom((src) => src.created_by),
          //   ),
          //   forMember(
          //     (destination) => destination.description,
          //     mapFrom((src) => src.description),
          //   ),
          //   forMember(
          //     (destination) => destination.event_id,
          //     mapFrom((src) => src.event_id),
          //   ),
          //   forMember(
          //     (destination) => destination.name,
          //     mapFrom((src) => src.name),
          //   ),
          //   forMember(
          //     (destination) => destination.price,
          //     mapFrom((src) => src.price),
          //   ),
          //   forMember(
          //     (destination) => destination.quantity,
          //     mapFrom((src) => src.quantity),
          //   ),
          //   forMember(
          //     (destination) => destination.sales_end,
          //     mapFrom((src) => src.sales_end),
          //   ),

          //   forMember(
          //     (destination) => destination.sales_start,
          //     mapFrom((src) => src.sales_start),
          //   ),

          //   forMember(
          //     (destination) => destination.schedule,
          //     mapFrom((src) => src.schedule),
          //   ),

          //   forMember(
          //     (destination) => destination.status,
          //     mapFrom((src) => src.status),
          //   ),

          //   forMember(
          //     (destination) => destination.update_by,
          //     mapFrom((src) => src.update_by),
          //   ),

          //   forMember(
          //     (destination) => destination.updated_at,
          //     mapFrom((src) => src.updated_at),
          //   ),
            
          //   forMember(
          //     (destination) => destination.ticket_list,
          //     mapFrom((src) =>
          //       src.ticket_list ? this.mapper.mapArray(src.ticket_list, TicketsList, TicketsList) : []
          //     ),
          //   ),
          // );


    };
  }
}
