import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateChatCommand } from "src/application/commands/chat/create-chat.command";
import { ChatService } from "src/application/services/chat/chat.service";
import { Chat } from "src/domain/entities/chat.entity";

@CommandHandler(CreateChatCommand)

export class CreateChatCommandHandler implements ICommandHandler<CreateChatCommand>{
    constructor(private readonly chatService:ChatService){}
    execute(command: CreateChatCommand): Promise<Chat> {
        const {sender_id,createChatDto} = command;
        return this.chatService.createMessage(sender_id,createChatDto);
    }
}