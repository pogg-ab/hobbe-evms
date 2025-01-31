import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ChatService } from '../../../application/services/chat/chat.service';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateChatDto } from 'src/presentation/dto/chat/create-chat.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateChatCommand } from 'src/application/commands/chat/create-chat.command';
import { FindOneChatQuery } from 'src/application/queries/chat/find-one.-chat.query';
import { UpdateChatCommand } from 'src/application/commands/chat/update-chat.command';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly chatService: ChatService,
  ) {}

  @ApiBody({ type: CreateChatDto })
  @ApiOperation({ description: 'Create a new Chat' })
  @HttpCode(200)
  @ApiResponse({
    type: CreateChatDto,
  })
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('send')
  async sendMessage(
    @Body() createChatDto: CreateChatDto,
    @CurrentUserId() user: any,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(
      new CreateChatCommand(user.user.user_id.toString(), createChatDto),
    );
    return { message: 'Sent message successfully !' };
  }

  @ApiOperation({ description: 'Get messages by sender' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  
  @Get('my-messages/:sender')
  
  async getMessages(
    @CurrentUserId() user: any,
    @Param('sender') sender: string
  ) {
    const messages = await this.chatService.getMessages(
      user,
      sender,
    );
    return { messages };
  }


  @ApiOperation({ description: 'Get Single Chat' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/find-one/:id')
  async findOne(@CurrentUserId() user: any, @Param('id') id: string) {
    return this.queryBus.execute(
      new FindOneChatQuery(user.user.user_id.toString(), id),
    );
  }

  @ApiOperation({ description: 'Update Chat' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/update/:id')
  async update(
    @CurrentUserId() user: any,
    @Param('id') id: string,
    @Body() text: string,
  ) {
    return this.commandBus.execute(
      new UpdateChatCommand(user.user.user_id.toString(), id, text),
    );
  }
}
