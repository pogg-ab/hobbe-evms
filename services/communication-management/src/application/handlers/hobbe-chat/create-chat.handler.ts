import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateChatCommand } from 'src/application/commands/hobbe-chat/create-chat.command';
import { ChatService } from 'src/application/services/hobbe-chat/chat.service';
import { Chat } from 'src/domain/entities/hobbe-chat/chat.entity';
import { ChatMemberRepository } from 'src/domain/repositories/hobbe-chat/chat-member.repository';
import { CHAT_MEMBER_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat-member.repository.token';
import { ChatRepository } from 'src/domain/repositories/hobbe-chat/chat.repository';
import { CHAT_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat.repository.token';
import { CreateChatDto } from 'src/presentation/dto/hobbe-chat/create-chat.dto';


@CommandHandler(CreateChatCommand)
export class CreateChatHandler implements ICommandHandler<CreateChatCommand> {
  constructor(
    private readonly chatService: ChatService,
  ) {}

  async execute(command:CreateChatCommand): Promise<Chat> {
    const { user, createChatDto } = command;
    return await this.chatService.createChat(user, createChatDto);
  }
}
