import { Controller, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AddChatMemberCommand } from 'src/application/commands/hobbe-chat/add-chat-member.command';
import { RemoveChatMemberCommand } from 'src/application/commands/hobbe-chat/remove.chat-membere.command';
import { AddChatMemberDto } from 'src/presentation/dto/hobbe-chat/add-chat-member.dto';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';


@Controller('chat-members')
@Controller('chats')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class ChatMemberController {
  constructor(private readonly commandBus: CommandBus) {}

  /**
   * Add a user to a chat
   */
  

  /**
   * Remove a user from a chat
   */
  @Delete(':chatId/:userId')
  async removeMember(@Param('chatId') chatId: string, @Param('userId') userId: string) {
    return this.commandBus.execute(new RemoveChatMemberCommand(chatId, userId));
  }
}
