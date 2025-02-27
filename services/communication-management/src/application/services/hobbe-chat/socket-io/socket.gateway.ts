import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { UserValidationService } from 'src/application/services/hobbe-chat/user-validation.service'; // Adjust path
import { HobbeChatService } from './chat-service/hobbe-chat-service';
import { UUID } from 'crypto';

@WebSocketGateway({
  cors: { origin: '*' }, // Adjust CORS as needed
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private usersMap = new Map<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    @Inject(UserValidationService)
    private readonly userValidationService: UserValidationService,
    private readonly hobbeChatService: HobbeChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake (e.g., auth or query)
      const token = client.handshake.auth.token || client.handshake.query.token;

      if (!token) {
        throw new Error('No token provided');
      }

      // Verify the JWT token using JwtService
      const payload = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET, // Match your strategy's secret
      });

      // Validate the user using the same service as JwtStrategy
      const validatedUser =
        await this.userValidationService.validateUser(payload);

      if (!validatedUser) {
        throw new Error('User validation failed');
      }
      const userId = validatedUser.user.user_id.toString(); // Assuming user ID is available
      this.usersMap.set(userId, client.id);
      
       console.dir(this.usersMap, {depth:null});
      // Attach user info to the socket for later use
      client['user'] = validatedUser;
     
      const chats = await this.hobbeChatService.getUserChats(
        userId,
      );
      client.emit('chat', chats);
    } catch (error) {
      console.error('Authentication failed:', error.message);
      client.disconnect(); // Disconnect if token is invalid or validation fails
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client['user'].user.user_id.toString();
    this.usersMap.delete(userId);
    console.log(`${client['user'].user.user_name} disconnected: ${client.id}`);
  }

  @SubscribeMessage('create-chat-room')
  handleChatRoom(client: Socket, friendId: string) {
    const creatorUserName = client['user'].user.user_name;
    console.log(`New Chat Room created by ${creatorUserName}`);
  
    // Notify the adder (creator)
    client.emit('chat-room-created', `You have added ${friendId} to the chat.`);
  
    // Find the friend's socket ID
    const friendSocketId = this.getUserSocketId(friendId);
    if (friendSocketId) {
      this.server.to(friendSocketId).emit('chat-room-invited', `${creatorUserName} added you to a chat.`);
      console.log(friendId, friendSocketId);
    }
  }
  

  // Example event handler
  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: string): void {
    console.log(`Message from ${client.id}: ${payload}`);
    this.server.emit('message', `Echo: ${payload}`);
  }


  private getUserSocketId(userId: string): string | undefined {
    return this.usersMap.get(userId);
  }
}
