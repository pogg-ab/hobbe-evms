import { IQuery } from "@nestjs/cqrs";


export class FindBankAccountByEventQuery implements IQuery{
    constructor(
        public readonly event: string
    ){}
}