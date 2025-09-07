import { ICommand } from "@nestjs/cqrs";
import { IdValueObject } from "src/domain/value-objects/event-id.value-object";
import { CreateTicketsDto } from "src/presentation/dtos/tickets/create-tickets.dto";
import { EntityManager } from "typeorm";

export class CreateTicketsCommand implements ICommand {
    constructor(
        public readonly createTicketsDto: CreateTicketsDto,
        public readonly entityManager?: EntityManager,
        // public readonly ticket_id:IdValueObject,
    ) { }
}