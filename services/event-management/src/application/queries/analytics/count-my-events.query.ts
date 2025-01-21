import { ICommand } from "@nestjs/cqrs";

export class CountMyEventCommand implements ICommand {
    constructor(
        public readonly user:string
    ){}
}