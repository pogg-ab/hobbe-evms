import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
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
    @Inject(UserValidationService)
    private readonly userValidationService: UserValidationService,
    private readonly hobbeChatService: HobbeChatService,
    private readonly chatUserService: ChatUserService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = client.handshake.auth.token || client.handshake.query.token;
      if (!token) throw new Error('No token provided');
      const payload = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      const validatedUser =
        await this.userValidationService.validateUser(payload);
      if (!validatedUser) throw new Error('User validation failed');

      const userId = validatedUser.user.user_id.toString();
      const profileId = validatedUser.user.profile_id.toString();
      const profileName = validatedUser.user.profile_name.toString();
      this.usersMap.set(userId, client.id);
      client.data.user = validatedUser;

      await this.chatUserService.chatUser(userId, profileId, profileName);
      const chats = await this.hobbeChatService.getUserChats(userId);
      const userName = client.data?.user?.user?.user_name?.toString();

      this.broadcastUserStatus(userId, true);
      client.emit('chat', chats);
      await this.chatUserService.chatUserStatus(userId, true);
    } catch (error) {
      client.emit('auth', error.message);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const userId = client.data?.user?.user?.user_id?.toString();
    // const userName =  client.data?.user?.user?.profile_id?.toString();
    await this.chatUserService.chatUserStatus(userId, false);
    if (userId) {
      this.usersMap.delete(userId);
      // console.log(`${userName} disconnected: ${client.id}`);
      this.broadcastUserStatus(userId, false);
    }
  }

  @SubscribeMessage('startTyping')
  handleStartTyping(
    @MessageBody()
    data: {
      chatId: string;
      toUserId: string;
      fromUserId: string;
    },
  ): void {
    const socketId = this.usersMap.get(data.toUserId);
    if (socketId) {
      this.server.to(socketId).emit('typing', {
        userId: data.fromUserId,
        isTyping: true,
        chatId: data.chatId,
      });
    }
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @MessageBody()
    data: {
      chatId: string;
      toUserId: string;
      fromUserId: string;
    },
  ): void {
    const socketId = this.usersMap.get(data.toUserId);
    if (socketId) {
      this.server.to(socketId).emit('typing', {
        userId: data.fromUserId,
        isTyping: false,
        chatId: data.chatId,
      });
    }
  }

  // @SubscribeMessage('startTyping')
  // handleStartTyping(
  //   client: Socket,
  //   @MessageBody() data: { chatId: string; toUserId: string }
  // ) {
  //   const targetSocketId = this.usersMap.get(data.toUserId);
  //   if (targetSocketId) {
  //     this.server.to(targetSocketId).emit('typing', {
  //       chatId: data.chatId,
  //       from: client.data.user?.user?.user_id, // or client.data.userId if you stored it
  //       isTyping: true,
  //     });
  //   }
  // }

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
