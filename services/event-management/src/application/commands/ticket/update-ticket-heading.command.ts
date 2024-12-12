import { ICommand } from "@nestjs/cqrs";
import { Tickets } from "src/domain/entities/tickets.entity";


export class UpdatedTicketHeadingCommand implements ICommand{
    constructor(
        public readonly id: string,
        public readonly ticket: Tickets,
        public readonly user: any,
    ){}
}