import { IQuery } from "@nestjs/cqrs";

export class GetChatMessagesQuery implements IQuery {
    constructor(
      public readonly user: string,
      public readonly chatId: string,
    ) {}
  }
  