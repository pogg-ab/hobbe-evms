import { ICommand } from "@nestjs/cqrs";
import { CreateMessageDto } from "src/presentation/dto/hobbe-chat/create-message.dto";

export class SendMessageCommand implements ICommand {
    constructor(
      public readonly user: string, 
      public readonly createMessageDto: CreateMessageDto
    ) {}
  }
  