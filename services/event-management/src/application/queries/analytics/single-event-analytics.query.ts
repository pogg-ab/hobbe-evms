import { ICommand } from "@nestjs/cqrs";

export class SingleEventAnalyticsCommand implements ICommand {
    constructor(
        public readonly user:string,
        public readonly event:string
    ){}
}