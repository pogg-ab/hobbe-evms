import { IQuery } from "@nestjs/cqrs";

export class FindOneCommentsQuery implements IQuery {
    constructor(
        public readonly comment_id: string,
        // public readonly user_id: any,
    ){}
}