import { IQuery } from "@nestjs/cqrs";


export class FindOneChatQuery implements IQuery{
    constructor(
        public readonly user:any,
        public readonly friend:string,
        public readonly chat_id:string
    ){}
}