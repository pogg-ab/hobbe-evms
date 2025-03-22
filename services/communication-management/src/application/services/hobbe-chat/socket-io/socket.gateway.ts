import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Inject, Injectable } from '@nestjs/common';
import { UserValidationService } from 'src/application/services/hobbe-chat/user-validation.service';
import { HobbeChatService } from './chat-service/hobbe-chat-service';
import { ChatUserService } from './user-service/chat-user-service';

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
    private readonly chatUserService: ChatUserService,

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
      // console.log(this.chatUserService.chatUser(userId));
      
      await this.chatUserService.chatUser(userId);
      const chats = await this.hobbeChatService.getUserChats(userId);
      const userName =  client.data?.user?.user?.user_name?.toString();

      this.broadcastUserStatus(userName, true);
      client.emit('chat', chats);
    } catch (error) {
      client.emit('auth',error.message)
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const userId = client.data?.user?.user?.user_id?.toString();
    const userName =  client.data?.user?.user?.user_name?.toString();
    if (userId) {
      this.usersMap.delete(userId);
      console.log(`${userName} disconnected: ${client.id}`);
      this.broadcastUserStatus(userName, false);
    }
  }


   notifyUser(userId: string, event: string, message: any): void {
    const socketId = this.usersMap.get(userId.toString());
    if (socketId) {
      this.server.to(socketId).emit(event, message);
    }
  }

  private broadcastUserStatus(userId: string, isOnline: boolean) {
    this.server.emit('user-status', { userId, isOnline });
  }
}
