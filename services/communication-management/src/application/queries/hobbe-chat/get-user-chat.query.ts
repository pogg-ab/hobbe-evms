import { IQuery } from "@nestjs/cqrs";

export class GetUserChatsQuery implements IQuery {
    constructor(public readonly userId: string) {}
  }
  