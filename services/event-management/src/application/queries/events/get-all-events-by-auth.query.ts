import { IQuery } from "@nestjs/cqrs";


export class GetAllEventsByAuthQuery implements IQuery{
    constructor(
        public readonly user: string, 
        public readonly page: number, 
        public readonly limit: number
    ){}
}