import { ICommand } from "@nestjs/cqrs";
import { CreateChatDto } from "src/presentation/dto/hobbe-chat/create-chat.dto";

export class CreateChatCommand implements ICommand{
    constructor(
      public readonly user: any,
      public readonly createChatDto: CreateChatDto,
    ) {}
  }
  