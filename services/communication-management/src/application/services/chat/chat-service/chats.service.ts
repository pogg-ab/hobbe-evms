import { Injectable } from '@nestjs/common';
import { firebaseDatabase } from 'src/infrastructure/firebase/firebase.config';

@Injectable()
export class ChatsService {
  private db = firebaseDatabase.ref('Hobbegram');

  async createChat(chatId: string, chatData: any) {
    await this.db.child(`chats/${chatId}`).set(chatData);
  }

  async updateLastMessage(chatId: string, chatData: any) {
    await this.db
      .child(`chats/${chatId}/lastMessage`)
      .update({
        senderId: chatId,
        text: chatData.messageData,
        timestamp: Date.now(),
      }); // Update the chat data with the new last message
  }

  async getChat(chatId: string) {
    const chatSnapshot = await this.db.child(`chats/${chatId}`).once('value');
    return chatSnapshot.val();
  }
}
