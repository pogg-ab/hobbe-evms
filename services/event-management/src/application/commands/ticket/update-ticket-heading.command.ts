import { ICommand } from "@nestjs/cqrs";
import { TicketsHeading } from "src/domain/entities/tickets-heading.entity";


export class UpdatedTicketHeadingCommand implements ICommand{
    constructor(
        public readonly id: string,
        public readonly ticket: TicketsHeading,
        public readonly user: any,
    ){}
}