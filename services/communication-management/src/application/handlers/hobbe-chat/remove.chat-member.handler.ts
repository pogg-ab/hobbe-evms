import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveChatMemberCommand } from 'src/application/commands/hobbe-chat/remove.chat-membere.command';
import { ChatMemberService } from 'src/application/services/hobbe-chat/chat-member.service';

@CommandHandler(RemoveChatMemberCommand)
export class RemoveChatMemberHandler implements ICommandHandler<RemoveChatMemberCommand> {
  constructor(private readonly chatMemberService: ChatMemberService) {}

  async execute(command: RemoveChatMemberCommand): Promise<void> {
    await this.chatMemberService.removeMember(command.chatId, command.userId);
  }
}
