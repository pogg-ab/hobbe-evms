import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  Patch,
  Delete,
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
import { UpdateChatDto } from 'src/presentation/dto/chat/update-chat.dto';
import { RemoveChatDto } from 'src/presentation/dto/chat/remove-chat.dto';
import { RemoveChatCommand } from 'src/application/commands/chat/remove-chat.command';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly chatService: ChatService,
  ) {}



  @ApiOperation({ description: 'Get start chating' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  
  @Get()

  async start(
    @CurrentUserId() user: any,
  ) {
    const messages = await this.chatService.start(
      user,
    );
    return { messages };
  }


  @ApiOperation({ description: 'Chat Home' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  
  @Get('/home')

  async chatHome(
    @CurrentUserId() user: any,
  ) {
    const data = await this.chatService.home(user);
    return { data };
  }

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

  @ApiOperation({ description: 'Get messages of friend' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  
  @Get('messages/:friend')
  async getMessages(
    @CurrentUserId() user: any,
    @Param('friend') friend: string
  ) {
    const messages = await this.chatService.getMessages(
      user,
      friend,
    );
    return { messages };
  }


  @ApiOperation({ description: 'Get Single Chat' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/find-one/:freind/:id')
  async findOne(
    @CurrentUserId() user: any, 
    @Param('freind') freind: string,
    @Param('id') id: string,
  ) {
    return this.queryBus.execute(
      new FindOneChatQuery(user,freind, id),
    );
  }

  @ApiOperation({ description: 'Update Chat' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/update')
  async update(
    @CurrentUserId() user: any,
    @Body() chat: UpdateChatDto,
  ) {
    return this.commandBus.execute(
      new UpdateChatCommand(user, chat),
    );
  }



  @ApiOperation({ description: 'Delete Chat' })
  @HttpCode(200)
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/remove')
  async remove(
    @CurrentUserId() user: any,
    @Body() chat: RemoveChatDto,
  ) {
    return this.commandBus.execute(
      new RemoveChatCommand(user, chat),
    );
  }
}
