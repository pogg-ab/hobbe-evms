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

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class MessageGateway {
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly messageService:MessageService,
    private readonly socketGateway:SocketGateway,
  ){}
  @SubscribeMessage('send-message')
  async handleMessage(client: Socket,createMessageDto : CreateMessageDto){
    const res = await this.messageService.sendMessage(client.data.user,createMessageDto);
    if (res) {
      client.emit('message-sent',res);
      this.socketGateway.notifyUser(res.message.receiver.userId, 'message-delivered', `${client.data.user.user.user_name} sent new message.`);
    }
    // this.server.emit('message', res);
  }

  
}
