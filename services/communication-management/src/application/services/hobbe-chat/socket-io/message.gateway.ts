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
import { Chat } from 'src/domain/entities/hobbe-chat/chat.entity';

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class MessageGateway {
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly messageService:MessageService,
    private readonly socketGateway:SocketGateway,
  ){}
  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket,createMessageDto : CreateMessageDto){
    const res = await this.messageService.sendMessage(client.data.user,createMessageDto);
    if (res) {
      client.emit('message-sent',res);
      const senderId: string = res.senderId;
      const receiverId: string = res.chat.members
          .filter((member: any) => member.userId !== senderId)
          .map((member: any) => member.userId);
          
      this.socketGateway.notifyUser (receiverId, 'message-delivered', res);
    } 
  }


  @SubscribeMessage('getPrivateMessages')
  async handlePrivateMessagse(client: Socket,chat : Chat){
    const res = await this.messageService.getPrivateMessages(client.data.user,chat);
    client.emit('chat-history',res);   
  }
}
