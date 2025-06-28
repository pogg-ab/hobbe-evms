import { IQuery } from "@nestjs/cqrs";

export class SingleSingupSourcesQuery implements IQuery {
  constructor(
    public readonly userId: string,
  ) {}
}
