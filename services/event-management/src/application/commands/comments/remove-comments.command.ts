import { ICommand } from "@nestjs/cqrs";


export class RemoveCommentsCommand implements ICommand{
    constructor(
        public readonly id:string
    ){}
}