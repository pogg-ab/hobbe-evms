import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Ticket } from 'src/domain/entities/support/ticket.entity';
import { CreateTicketDto } from 'src/presentation/dto/support/ticket/ticket.dto';
import { UpdateTicketDto } from 'src/presentation/dto/support/ticket/ticket.dto';
@Injectable()
export class TicketProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            // CreateTicketDto -> Ticket
            createMap(
                mapper,
                CreateTicketDto,
                Ticket,
                forMember(
                    (destination) => destination.subject,
                    mapFrom((src) => src.subject),
                ),
                forMember(
                    (destination) => destination.description,
                    mapFrom((src) => src.description),
                ),
                forMember(
                    (destination) => destination.email,
                    mapFrom((src) => src.email),
                ),
                forMember(
                    (destination) => destination.priority,
                    mapFrom((src) => src.priority),
                ),
                forMember(
                    (destination) => destination.status,
                    mapFrom((src) => src.status),
                ),

            );

            // UpdateTicketDto -> Ticket (partial mapping)
            createMap(
                mapper,
                UpdateTicketDto,
                Ticket,
                forMember(
                    (destination) => destination.subject,
                    mapFrom((src) => src.subject),
                ),
                forMember(
                    (destination) => destination.description,
                    mapFrom((src) => src.description),
                ),
                forMember(
                    (destination) => destination.email,
                    mapFrom((src) => src.email),
                ),
                forMember(
                    (destination) => destination.priority,
                    mapFrom((src) => src.priority),
                ),
                forMember(
                    (destination) => destination.status,
                    mapFrom((src) => src.status),
                ),

            );
        };
    }
}