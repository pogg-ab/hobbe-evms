import { Controller, Post, Delete, Param, Body } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AddChatMemberCommand } from 'src/application/commands/hobbe-chat/add-chat-member.command';
import { RemoveChatMemberCommand } from 'src/application/commands/hobbe-chat/remove.chat-membere.command';


@Controller('chat-members')
export class ChatMemberController {
  constructor(private readonly commandBus: CommandBus) {}

  /**
   * Add a user to a chat
   */
  @Post()
  async addMember(@Body() body: { chatId: string; userId: string }) {
    return this.commandBus.execute(new AddChatMemberCommand(body.chatId, body.userId));
  }

  /**
   * Remove a user from a chat
   */
  @Delete(':chatId/:userId')
  async removeMember(@Param('chatId') chatId: string, @Param('userId') userId: string) {
    return this.commandBus.execute(new RemoveChatMemberCommand(chatId, userId));
  }
}
