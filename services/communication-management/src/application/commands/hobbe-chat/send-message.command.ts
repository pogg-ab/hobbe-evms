import { ICommand } from "@nestjs/cqrs";
import { ChatUser } from "src/domain/entities/hobbe-chat/chat-user.entity";
import { CreateMessageDto } from "src/presentation/dto/hobbe-chat/create-message.dto";

export class SendMessageCommand implements ICommand {
    constructor(
      public readonly user: ChatUser, 
      public readonly createMessageDto: CreateMessageDto
    ) {}
  }
  