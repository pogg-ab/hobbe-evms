import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddChatMemberCommand } from 'src/application/commands/hobbe-chat/add-chat-member.command';
import { ChatMemberRepository } from 'src/domain/repositories/hobbe-chat/chat-member.repository';
import { CHAT_MEMBER_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat-member.repository.token';


@CommandHandler(AddChatMemberCommand)
export class AddChatMemberHandler implements ICommandHandler<AddChatMemberCommand> {
  constructor(
    @Inject(CHAT_MEMBER_REPOSITORY_TOKEN)
    private readonly chatMemberRepo: ChatMemberRepository
  ) {}

  async execute(command: AddChatMemberCommand): Promise<void> {
    await this.chatMemberRepo.addMember(command.chatId, command.userId);
  }
}
