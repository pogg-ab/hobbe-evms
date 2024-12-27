import { IQuery } from "@nestjs/cqrs";


export class FindOneBankAccountQuery implements IQuery {
    constructor(
        public readonly id: string
    ){}
}