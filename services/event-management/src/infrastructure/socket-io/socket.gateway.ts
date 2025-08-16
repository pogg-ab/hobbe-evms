import { Injectable } from "@nestjs/common";
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";

import { Socket, Server } from "socket.io";

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class SocketIo implements OnGatewayConnection, OnGatewayDisconnect {
   
    @WebSocketServer() server: Server;

     handleConnection(client: Socket): void {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket): void {
        console.log(`Client connected: ${client.id}`);

        }

    @SubscribeMessage('likeCounters')
    handleAllEventLikesCounter(@MessageBody() message: any) {
        this.server.emit('count-all-event-likes', message);
    }
    handleSigleEventLikesCounter(@MessageBody() message: any) {
        this.server.emit('count-single-event-likes', message);
    }

    @SubscribeMessage('favoriteCounters')
    handleAllEventFavoritesCounter(@MessageBody() message:any){
        this.server.emit('count-all-event-favorites', message);
    }
    handleSigleEventFavoritesCounter(@MessageBody() message:any){
        this.server.emit('count-single-event-favorites', message);
    }


     @SubscribeMessage('shareCounters')
    handleAllEventShareCounter(@MessageBody() message:any){
        this.server.emit('count-all-event-share', message);
    }
    handleSigleEventShareCounter(@MessageBody() message:any){
        this.server.emit('count-single-event-share', message);
    }

    @SubscribeMessage('commentsCounters')
    handleAllEventsCommentsCounter(@MessageBody() message: any) {
        this.server.emit('count-all-event-comments', message);
    }
    handleSingleEventCommentsCounter(@MessageBody() message: any) {
        this.server.emit('count-single-event-comments', message);
    }

    @SubscribeMessage('eventRemainingTime')
    async handleEventRemainingTime(@MessageBody() message: any) {
        const { event_id, remainingTime } = message;
        this.server.emit(`event-remaining-time_${event_id}`, { event_id, remainingTime });
    }

    @SubscribeMessage('liveTicketPurchaseCounter')
    async handleLiveTicketPurchaseCounter(@MessageBody() message: any) {
        const { event_id, totalTickets } = message;
        this.server.emit(`live-ticket-purchase-count_${event_id}`, { event_id, totalTickets });
    }
}