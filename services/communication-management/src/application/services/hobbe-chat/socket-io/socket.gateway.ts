import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Inject, Injectable } from '@nestjs/common';
import { UserValidationService } from 'src/application/services/hobbe-chat/user-validation.service';
import { HobbeChatService } from './chat-service/hobbe-chat-service';
import { CreatePrivateChatDto } from 'src/presentation/dto/hobbe-chat/create-chat.dto';

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  private readonly usersMap = new Map<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    @Inject(UserValidationService) private readonly userValidationService: UserValidationService,
    private readonly hobbeChatService: HobbeChatService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = client.handshake.auth.token || client.handshake.query.token;
      if (!token) throw new Error('No token provided');

      const payload = await this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      const validatedUser = await this.userValidationService.validateUser(payload);
      if (!validatedUser) throw new Error('User validation failed');

      const userId = validatedUser.user.user_id.toString();
      this.usersMap.set(userId, client.id);
      client.data.user = validatedUser;

      // console.dir(this.usersMap, { depth: null });

      const chats = await this.hobbeChatService.getUserChats(userId);
      client.emit('chat', chats);
    } catch (error) {
      client.emit('auth',error.message)
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const userId = client.data?.user?.user?.user_id?.toString();
    if (userId) {
      this.usersMap.delete(userId);
      console.log(`${client.data.user.user.user_name} disconnected: ${client.id}`);
    }
  }

  @SubscribeMessage('create-chat-room')
  async handleChatRoom(client: Socket, dto: CreatePrivateChatDto): Promise<void> {
    const chat = await this.hobbeChatService.createChat(client.data.user, dto);
    if (!chat.message) {
      client.emit('chat-room-created', `You have added ${dto.name} to the chat.`);
      this.notifyUser(dto.friendId, 'chat-room-invited', `${client.data.user.user.user_name} added you to a chat.`);
    } else {
      client.emit('chat-room-created', `You have already added ${dto.name} to the chat.`);
    }
  }


   notifyUser(userId: string, event: string, message: string): void {
    const socketId = this.usersMap.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, message);
    }
  }
}
