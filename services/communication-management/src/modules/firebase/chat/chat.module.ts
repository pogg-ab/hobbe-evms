import { Module } from '@nestjs/common';
import { ChatService } from 'src/application/services/chat/chat.service';
import { ChatController } from 'src/presentation/controller/chat/chat.controller';

@Module({
    providers:[ChatService],
    controllers:[ChatController],
    exports:[],
    imports:[]
})
export class ChatModule {}
