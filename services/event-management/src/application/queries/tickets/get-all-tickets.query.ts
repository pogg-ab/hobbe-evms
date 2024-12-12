import { IQuery } from "@nestjs/cqrs";


export class GetAllTicketsQuery implements IQuery{
    constructor(
      public readonly page: number,
      public readonly limit: number,
    ){}
}