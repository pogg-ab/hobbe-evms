import { Injectable } from '@nestjs/common';
import { firebaseDatabase } from '../../../infrastructure/firebase/firebase.config';

@Injectable()
export class ChatService {
  private chatRef = firebaseDatabase.ref('chats'); // Realtime DB "chats" node

  async sendMessage(chatRoom: string, message: any): Promise<void> {
    await this.chatRef.child(chatRoom).push(message);
  }

  async getMessages(chatRoom: string): Promise<any[]> {
    const snapshot = await this.chatRef.child(chatRoom).once('value');
    const messages = snapshot.val();
    return messages ? Object.values(messages) : [];
  }
}
