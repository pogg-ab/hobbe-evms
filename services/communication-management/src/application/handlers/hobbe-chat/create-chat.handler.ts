
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateChatCommand } from 'src/application/commands/hobbe-chat/create-chat.command';
import { ChatService } from 'src/application/services/hobbe-chat/chat.service';
import { Chat } from 'src/domain/entities/hobbe-chat/chat.entity';


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
