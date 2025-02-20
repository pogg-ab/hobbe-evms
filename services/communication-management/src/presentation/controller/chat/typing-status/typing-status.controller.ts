import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { TypingStatusService } from 'src/application/services/chat/typing-status-service/typing-status.service';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';

@Controller('typing-status')
export class TypingStatusController {
  constructor(private typingStatusService: TypingStatusService) {}

  @ApiOperation({ description: 'Update Typing Status' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('update')
  async updateTypingStatus(
    @Body() status: { chatId: string; userId: string; isTyping: boolean },
  ) {
    await this.typingStatusService.updateTypingStatus(
      status.chatId,
      status.userId,
      status.isTyping,
    );
    return { chat: 'Typing Status Update successfully' };
  }

  @Get(':chatId')
  async getTypingStatus(@Param('chatId') chatId: string) {
    const status = await this.typingStatusService.getTypingStatus(chatId);
    return status ? status : { message: 'No typing status found for this chat' };
  }
}
