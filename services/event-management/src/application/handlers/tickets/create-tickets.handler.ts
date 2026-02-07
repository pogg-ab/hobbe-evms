import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateTicketsCommand } from "src/application/commands/ticket/create-tickets.command";
import { TicketsService } from "src/application/services/tickets/tickets.service";


@CommandHandler(CreateTicketsCommand)
export class CreateTicketsCommandHandler implements ICommandHandler<CreateTicketsCommand> {
    constructor(
        private readonly ticketsService: TicketsService,
        // private readonly ticket_id: IdValueObject,
    ) { }
    async execute(command: CreateTicketsCommand): Promise<void> {
        const { createTicketsDto, entityManager } = command;
        return this.ticketsService.create(createTicketsDto, entityManager);
    }
}