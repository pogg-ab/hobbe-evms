import { IQuery } from "@nestjs/cqrs";

export class GetAllReceivedGiftsQuery implements IQuery {
    constructor(
        public readonly userId: string
    ) {}
}