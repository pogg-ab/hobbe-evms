import { ICommand } from "@nestjs/cqrs";
import { IdValueObject } from "src/domain/value-objects/event-id.value-object";
import { CreateTicketsListDto } from "src/presentation/dtos/tickets/create-tickets-list.dto";

export class CreateTicketsListCommand implements ICommand {
    constructor(
        public readonly createTicketsListDto: CreateTicketsListDto,
        // public readonly ticket_id:IdValueObject,
    ){}
}