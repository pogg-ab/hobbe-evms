import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendMessageCommand } from 'src/application/commands/hobbe-chat/send-message.command';
import { Message } from 'src/domain/entities/hobbe-chat/message.entity';
import { CHAT_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat.repository.token';
import { MessageRepository } from 'src/domain/repositories/hobbe-chat/message.repository';
import { MESSAGE_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/message.repository.token copy';


@CommandHandler(SendMessageCommand)
export class SendMessageHandler implements ICommandHandler<SendMessageCommand> {
  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)
    private readonly messageRepo: MessageRepository
  ) {}

  async execute(command: SendMessageCommand): Promise<Message> {
    return this.messageRepo.sendMessage(command.chatId, command.senderId, command.content);
  }
}
