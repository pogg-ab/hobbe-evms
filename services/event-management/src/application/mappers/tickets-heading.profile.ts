import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { TicketsHeading } from 'src/domain/entities/tickets-heading.entity';
import { CreateTicketsHeadingDto } from 'src/presentation/dtos/tickets/create-tickets-heading.dto';
import { UpdateTicketsHeadingDto } from 'src/presentation/dtos/tickets/update-tickets-heading.dto';

@Injectable()
export class TicktesHeadingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CreateTicketsHeadingDto,
        TicketsHeading,
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

      createMap(
        mapper,
        UpdateTicketsHeadingDto,
        TicketsHeading,
        forMember(
          (destination) => destination.name,
          mapFrom((src) => src.name),
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
