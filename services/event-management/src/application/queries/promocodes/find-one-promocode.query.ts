import { IQuery } from "@nestjs/cqrs";


export class FindOnePoromocodeQuery implements IQuery{
    constructor(
        public readonly id:number
    ){}
}