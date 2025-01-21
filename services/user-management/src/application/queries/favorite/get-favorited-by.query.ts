import { IQuery } from "@nestjs/cqrs";

export class GetFavoritedByQuery implements IQuery {
    constructor(public readonly userId: string) {}
  }
  