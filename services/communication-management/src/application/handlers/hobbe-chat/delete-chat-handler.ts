import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteChatCommand } from 'src/application/commands/hobbe-chat/delete-chat-command';
import { ChatService } from 'src/application/services/hobbe-chat/chat.service';
import { ChatRepository } from 'src/domain/repositories/hobbe-chat/chat.repository';


@CommandHandler(DeleteChatCommand)
export class DeleteChatHandler implements ICommandHandler<DeleteChatCommand> {
  constructor(private readonly chatService: ChatService) {}

  async execute(command: DeleteChatCommand): Promise<void> {
    await this.chatService.softDeleteChat(command.chatId);
  }
}
