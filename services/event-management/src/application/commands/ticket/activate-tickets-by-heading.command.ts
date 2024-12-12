import { ICommand } from "@nestjs/cqrs";



export class ActivateTicketsByHeadingCommand implements ICommand{
    constructor(
        public readonly id:string,
        public readonly status:string,
        public readonly user:any,
    ){}
}