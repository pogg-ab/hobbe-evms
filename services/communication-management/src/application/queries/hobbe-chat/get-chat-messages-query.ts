import { IQuery } from "@nestjs/cqrs";
import { ChatUser } from "src/domain/entities/hobbe-chat/chat-user.entity";
import { Chat } from "src/domain/entities/hobbe-chat/chat.entity";

export class GetChatMessagesQuery implements IQuery {
    constructor(
      public readonly user: ChatUser,
      public readonly chatId: Chat,
    ) {}
  }
  