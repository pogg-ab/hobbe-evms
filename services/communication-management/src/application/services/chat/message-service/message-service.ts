import { Injectable } from '@nestjs/common';
import { firebaseDatabase } from 'src/infrastructure/firebase/firebase.config';
import { ChatsService } from '../chat-service/chats.service';

@Injectable()
export class MessageService {
  constructor(public readonly chatService: ChatsService) {}
  private db = firebaseDatabase.ref('Hobbegram'); 

  async sendMessage(chatId: string, messageData: any) {
    await this.db.child(`messages/${chatId}/`).push(messageData); 
    await this.chatService.updateLastMessage(chatId,messageData);
  }

  async getMessages(chatId: string) {
    const messagesSnapshot = await this.db.child(`messages/${chatId}`).once('value'); 
    return messagesSnapshot.val();
  }
}
