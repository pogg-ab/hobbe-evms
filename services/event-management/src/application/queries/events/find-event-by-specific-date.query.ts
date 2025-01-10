import { IQuery } from "@nestjs/cqrs";


export class FindEventsBySpecificDate implements IQuery{
    constructor(
        public readonly specificDate: Date,
    ){}
}