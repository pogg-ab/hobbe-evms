import { IQuery } from "@nestjs/cqrs";



export class SearchEventQuery implements IQuery{
    constructor(
        public readonly keyword: string,
        public readonly page:number, 
        public readonly limit:number
    ){}
}