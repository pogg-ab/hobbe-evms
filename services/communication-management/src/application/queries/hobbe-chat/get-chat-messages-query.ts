import { IQuery } from "@nestjs/cqrs";

export class GetChatMessagesQuery implements IQuery {
    constructor(public readonly chatId: string) {}
  }
  