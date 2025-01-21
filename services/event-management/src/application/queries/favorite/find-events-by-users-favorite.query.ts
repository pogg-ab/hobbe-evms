import { IQuery } from "@nestjs/cqrs";


export class FindEventsByUsersFavoriteQuery implements IQuery {
  constructor(public readonly user: string) {}
}