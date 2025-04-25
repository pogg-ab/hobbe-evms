import { IQuery } from "@nestjs/cqrs";



export class FindOneQuery implements IQuery{
    constructor(
        public readonly id: string,
    ){}
}