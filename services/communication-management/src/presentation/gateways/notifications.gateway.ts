import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit, // <-- 1. IMPORT OnGatewayInit
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Notification } from 'src/domain/entities/notification.entity';

@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit // <-- 2. IMPLEMENT OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  // --- 3. ADD THE REQUIRED afterInit METHOD ---
  afterInit(server: Server) {
    this.logger.log("NotificationsGateway initialized");
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      this.logger.log(`Client connected: ${client.id} to /notifications for user: ${userId}`);
      client.join(userId);
    } else {
      this.logger.warn(`Client connected to /notifications without userId: ${client.id}. Disconnecting.`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from /notifications: ${client.id}`);
  }

  sendNotificationToUser(userId: string, notification: Notification) {
    this.logger.log(`Emitting 'new_notification' event to user room: ${userId} in /notifications`);
    this.server.to(userId).emit('new_notification', notification);
  }
}