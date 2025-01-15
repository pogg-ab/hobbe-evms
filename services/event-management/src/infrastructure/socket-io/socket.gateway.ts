import { Injectable } from "@nestjs/common";
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";

import { Socket,Server } from "socket.io";

@WebSocketGateway(4011,{cors:{origin:"*"}})
@Injectable()
export class SocketIo{
    @WebSocketServer() server:Server;

    @SubscribeMessage('likeCounters')
    handleLikesCounter(@MessageBody() message:any){
        this.server.emit('count-likes', message);
    }

    @SubscribeMessage('commentsCounters')
    handleCommentsCounter(@MessageBody() message:any){
        this.server.emit('count-comments', message);
    }
}