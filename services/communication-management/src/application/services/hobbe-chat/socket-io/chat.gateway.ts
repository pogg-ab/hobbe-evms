import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { MessageService } from './message-service/message-service';
import { CreateMessageDto } from 'src/presentation/dto/hobbe-chat/create-message.dto';
import { SocketGateway } from './socket.gateway';
import { HobbeChatService } from './chat-service/hobbe-chat-service';
import { CreatePrivateChatDto } from 'src/presentation/dto/hobbe-chat/create-chat.dto';

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class ChatGateway {
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly hobbeChatService:HobbeChatService,
    private readonly socketGateway:SocketGateway,
  ){}
//   @SubscribeMessage('joinChat')
//   async handleChatRoom(client: Socket, dto: CreatePrivateChatDto): Promise<void> {
//     const chat = await this.hobbeChatService.createChat(client.data.user, dto);
//     if (!chat.message) {
//       client.emit('chat-room-created', `You have added ${dto.name} to the chat.`);
//       this.socketGateway.notifyUser(dto.friendId, 'chat-room-invited', `${client.data.user.user.user_name} added you to a chat.`);
//     } else {
//       client.emit('chat-room-created', `You have already added ${dto.name} to the chat.`);
//     }
//   }


@SubscribeMessage('createChat')
async handleChatRoom(client: Socket, dto: CreatePrivateChatDto): Promise<void> {
  try {
    const { user } = client.data;
    const chat = await this.hobbeChatService.createChat(user, dto);
    console.dir(chat,{depth:null});
    
    
    if (!chat.isExisting) {
      const creator = {message: `New Chat Room Created.`, chat}
      const receiver = {message: `${user.user.user_name} has invited you to chat with him .`, chatId:chat.id}
      client.emit('chat-room-created', creator);
      this.socketGateway.notifyUser(dto.friendId, 'chat-room-invited', receiver);
    } else {
      const msg = {message: `Chat with ${dto.friendId} already exists. `, chatId:chat.id}
      client.emit('chat-room-created',msg );
    }
  } catch (error) {
    client.emit('chat-room-error', `An error occurred while creating the chat: ${error.message}`);
  }
 }  
}
