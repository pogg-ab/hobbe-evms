import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveChatMemberCommand } from 'src/application/commands/hobbe-chat/remove.chat-membere.command';
import { ChatMemberRepository } from 'src/domain/repositories/hobbe-chat/chat-member.repository';

@CommandHandler(RemoveChatMemberCommand)
export class RemoveChatMemberHandler implements ICommandHandler<RemoveChatMemberCommand> {
  constructor(private readonly chatMemberRepo: ChatMemberRepository) {}

  async execute(command: RemoveChatMemberCommand): Promise<void> {
    await this.chatMemberRepo.removeMember(command.chatId, command.userId);
  }
}
