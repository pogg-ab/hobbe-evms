import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddChatMemberCommand } from 'src/application/commands/hobbe-chat/add-chat-member.command';
import { ChatMemberService } from 'src/application/services/hobbe-chat/chat-member.service';
import { ChatService } from 'src/application/services/hobbe-chat/chat.service';



@CommandHandler(AddChatMemberCommand)
export class AddChatMemberHandler implements ICommandHandler<AddChatMemberCommand> {
  constructor(
    private readonly chatService: ChatService
  ) {}

  async execute(command: AddChatMemberCommand): Promise<void> {
    const { addChatMemberDto } = command;
    // await this.chatService.addChatMember(addChatMemberDto);
  }
}
