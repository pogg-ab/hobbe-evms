import { IQuery } from "@nestjs/cqrs";

export class FindUserFavoritesQuery implements IQuery {
  constructor(public readonly userId: string) { }
}

