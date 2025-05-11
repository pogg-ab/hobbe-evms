import { IQuery } from "@nestjs/cqrs";

export class FindFavoritedByQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly page: number,
    public readonly limit: number,) { }
}
