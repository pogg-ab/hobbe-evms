import { IQuery } from "@nestjs/cqrs";

export class FindByEventCommentsQuery implements IQuery {
    constructor(
        public readonly event_id: string,
    ){}
}