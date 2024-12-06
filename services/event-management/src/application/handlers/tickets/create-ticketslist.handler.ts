import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateTicketsListCommand } from "src/application/commands/ticket/create-ticketslist.command";
import { TicketsService } from "src/application/services/tickets/tickets.service";
import { TicketsList } from "src/domain/entities/tickets_list.entity";
import { IdValueObject } from "src/domain/value-objects/event-id.value-object";

@CommandHandler(CreateTicketsListCommand)
export class CreateTicketsListCommandHandler implements ICommandHandler<CreateTicketsListCommand>{
    constructor(
        private readonly ticketsService: TicketsService,
        // private readonly ticket_id: IdValueObject,
    ) {}
   async execute(command: CreateTicketsListCommand): Promise<TicketsList> {
       const { createTicketsListDto } = command;
       return this.ticketsService.create(createTicketsListDto);
    }
}