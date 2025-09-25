import { IQuery } from "@nestjs/cqrs";

export class GetAllSentGiftsQuery implements IQuery {
    constructor(
        public readonly userId: string
    ) {}
}