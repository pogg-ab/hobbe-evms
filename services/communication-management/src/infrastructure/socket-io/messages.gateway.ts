import { 
    WebSocketGateway, 
    SubscribeMessage, 
    MessageBody, 
    ConnectedSocket, 
    WebSocketServer 
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { CommandBus } from '@nestjs/cqrs';
import { SendMessageCommand } from 'src/application/commands/messages/send-message.command';
  
  @WebSocketGateway(4411, { cors: true })
  export class MessagesGateway {
    @WebSocketServer()
    server: Server; // ✅ WebSocket Server Instance
  
    constructor(private readonly commandBus: CommandBus) {}
  
    @SubscribeMessage('sendMessage')
    async handleMessage(
      @MessageBody() data: { senderId: number; receiverId: number; content: string },
      @ConnectedSocket() client: Socket
    ) {
      const message = await this.commandBus.execute(
        new SendMessageCommand(data.senderId, data.receiverId, data.content)
      );
  
      // ✅ Broadcast from the WebSocket server (not just the sender)
      this.server.to(`user_${data.receiverId}`).emit('newMessage', message);
      client.to(`user_${data.senderId}`).emit('newMessage', message);
  
      console.log(`Message sent to user_${data.receiverId}:`, message);
  
      return message; // Echo back to the sender if needed
    }
  
    @SubscribeMessage('join')
    handleJoin(@MessageBody() userId: number, @ConnectedSocket() client: Socket) {
      client.join(`user@${userId}`);
      console.log(`User ${userId} joined room: user@${userId}`);
    }
  }
  