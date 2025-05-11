import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/stream' })
export class SocketGateway {
    @WebSocketServer()
    server: Server;

    afterInit() {
        this.server.on('connection', (socket) => {
            console.log('Client connected to /stream namespace');
            socket.emit('connect', { status: 'connected' });
        });
    }
}