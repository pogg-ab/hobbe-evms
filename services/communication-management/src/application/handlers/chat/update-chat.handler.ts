import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateChatCommand } from "src/application/commands/chat/create-chat.command";
import { UpdateChatCommand } from "src/application/commands/chat/update-chat.command";
import { ChatService } from "src/application/services/chat/chat.service";
import { Chat } from "src/domain/entities/chat.entity";

@CommandHandler(UpdateChatCommand)

export class UpdateChatCommandHandler implements ICommandHandler<UpdateChatCommand>{
    constructor(private readonly chatService:ChatService){}
    execute(command: UpdateChatCommand): Promise<Chat> {
        const {user,chat_id,text} = command;
        return this.chatService.updateMessage(user,chat_id,text);
    }
}