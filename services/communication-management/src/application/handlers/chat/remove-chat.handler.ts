import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RemoveChatCommand } from "src/application/commands/chat/remove-chat.command";
import { ChatService } from "src/application/services/chat/chat.service";
import { Chat } from "src/domain/entities/chat.entity";

@CommandHandler(RemoveChatCommand)

export class RemoveChatCommandHandler implements ICommandHandler<RemoveChatCommand>{
    constructor(private readonly chatService:ChatService){}
    execute(command: RemoveChatCommand): Promise<Chat> {
        const {user,chat} = command;
        return this.chatService.removeMessage(user,chat);
    }
}