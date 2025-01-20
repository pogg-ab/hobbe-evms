import { Injectable } from "@nestjs/common";
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";

import { Socket, Server } from "socket.io";

@WebSocketGateway(4011, { cors: { origin: "*" } })
@Injectable()
export class SocketIo {
    @WebSocketServer() server: Server;

    @SubscribeMessage('likeCounters')
    handleAllEventLikesCounter(@MessageBody() message: any) {
        this.server.emit('count-all-event-likes', message);
    }
    handleSigleEventLikesCounter(@MessageBody() message: any) {
        this.server.emit('count-single-event-likes', message);
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
}