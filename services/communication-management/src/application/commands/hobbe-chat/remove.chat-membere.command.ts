import { ICommand } from "@nestjs/cqrs";
import { ChatUser } from "src/domain/entities/hobbe-chat/chat-user.entity";
import { Chat } from "src/domain/entities/hobbe-chat/chat.entity";

export class RemoveChatMemberCommand implements ICommand {
    constructor(
      public readonly chat: Chat, 
      public readonly user: ChatUser
    ) {}
  }
  