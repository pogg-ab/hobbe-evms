import { Module } from '@nestjs/common';
import { SocketIo } from 'src/infrastructure/socket-io/socket.gateway';

@Module({
    providers:[SocketIo]
})
export class SocketIoModule {}
