import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateChatCommand } from 'src/application/commands/hobbe-chat/create-chat.command';
import { Chat } from 'src/domain/entities/hobbe-chat/chat.entity';
import { ChatMemberRepository } from 'src/domain/repositories/hobbe-chat/chat-member.repository';
import { CHAT_MEMBER_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat-member.repository.token';
import { ChatRepository } from 'src/domain/repositories/hobbe-chat/chat.repository';
import { CHAT_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat.repository.token';


@CommandHandler(CreateChatCommand)
export class CreateChatHandler implements ICommandHandler<CreateChatCommand> {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN)
    private readonly chatRepo: ChatRepository,
    @Inject(CHAT_MEMBER_REPOSITORY_TOKEN)
    private readonly chatMemberRepo: ChatMemberRepository
  ) {}

  async execute(command: CreateChatCommand): Promise<Chat> {
    const { userId, friendId, type, name } = command;

    // Check if private chat exists
    if (type === 'private' && friendId) {
      const existingChat = await this.chatRepo.findPrivateChat(userId, friendId);
      if (existingChat) return existingChat;
    }

    // Create a new chat

    const chat = await this.chatRepo.create(type,name);
    await this.chatMemberRepo.addMember(chat.id, userId);

    if (type === 'private' && friendId) {
      await this.chatMemberRepo.addMember(chat.id, friendId);
    }

    return chat;
  }
}
