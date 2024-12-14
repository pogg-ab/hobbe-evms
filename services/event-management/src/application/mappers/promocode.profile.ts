import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Events } from 'src/domain/entities/events.entity';
import { Promocodes } from 'src/domain/entities/promocodes.entity';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { UpdateEventsDto } from 'src/presentation/dtos/events/update-events.dto';
import { CreatePromocodeDto } from 'src/presentation/dtos/tickets/create-promocode.dto';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';
import { UpdatePromocodeDto } from 'src/presentation/dtos/tickets/update.promocode.dto';

@Injectable()
export class PromocodeProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CreatePromocodeDto,
        Promocodes,
        forMember(
          (destination) => destination.code,
          mapFrom((src) => src.code),
        ),

        forMember(
          (destination) => destination.quantity,
          mapFrom((src) => src.quantity),
        ),

        forMember(
          (destination) => destination.discount,
          mapFrom((src) => src.discount),
        ),

        // forMember(
        //   (destination) => destination.available_quantity,
        //   mapFrom((src) => src.quantity),
        // ),

        forMember(
          (destination) => destination.promo_start_date,
          mapFrom((src) => src.promo_start_date),
        ),

        forMember(
          (destination) => destination.promo_end_date,
          mapFrom((src) => src.promo_end_date),
        ),
        // forMember(
        //   (destination) => destination.event_id,
        //   mapFrom((src) => src.event_id),
        // ),

        // forMember(
        //   (destination) => destination.event_id,
        //   mapFrom((src) => src.event_id),
        // ),

        // forMember(
        //   (destination) => destination.ticket_heading_id,
        //   mapFrom((src) => src.ticket_heading_id),
        // ),

        forMember(
          (destination) => destination.description,
          mapFrom((src) => src.description),
        ),
      );

      createMap(
        mapper,
        UpdatePromocodeDto,
        Promocodes,
        forMember(
          (destination) => destination.code,
          mapFrom((src) => src.code),
        ),

        forMember(
          (destination) => destination.quantity,
          mapFrom((src) => src.quantity),
        ),

        forMember(
          (destination) => destination.discount,
          mapFrom((src) => src.discount),
        ),


        forMember(
          (destination) => destination.promo_start_date,
          mapFrom((src) => src.promo_start_date),
        ),

        forMember(
          (destination) => destination.promo_end_date,
          mapFrom((src) => src.promo_end_date),
        ),
     

        forMember(
          (destination) => destination.description,
          mapFrom((src) => src.description),
        ),

      
      );
    };
  }
}
