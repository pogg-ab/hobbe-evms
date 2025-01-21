import { IQuery } from "@nestjs/cqrs";

export class GetFavoritesQuery implements IQuery {
  constructor(public readonly userId: string) { }
}
