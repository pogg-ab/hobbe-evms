import { ICommand } from "@nestjs/cqrs";
import { IdValueObject } from "src/domain/value-objects/event-id.value-object";
import { CreateTicketsHeadingDto } from "src/presentation/dtos/tickets/create-tickets-heading.dto";


export class CreateTicketsHeadingCommand implements ICommand {
    constructor(
        public readonly event_id: IdValueObject,
        public readonly createTicketsHeadingDto: CreateTicketsHeadingDto,
    ) {}
}