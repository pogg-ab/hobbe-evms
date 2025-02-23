import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteChatCommand } from 'src/application/commands/hobbe-chat/delete-chat-command';
import { ChatRepository } from 'src/domain/repositories/hobbe-chat/chat.repository';


@CommandHandler(DeleteChatCommand)
export class DeleteChatHandler implements ICommandHandler<DeleteChatCommand> {
  constructor(private readonly chatRepo: ChatRepository) {}

  async execute(command: DeleteChatCommand): Promise<void> {
    await this.chatRepo.softDeleteChat(command.chatId);
  }
}
