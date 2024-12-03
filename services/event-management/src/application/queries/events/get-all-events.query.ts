import { IQuery } from "@nestjs/cqrs";


export class GetAllEventsQuery implements IQuery{
    constructor(
        // public readonly total: number, 
        public readonly page: number, 
        public readonly limit: number
    ){}
}