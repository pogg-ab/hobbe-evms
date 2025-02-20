import { Injectable } from '@nestjs/common';
import { firebaseDatabase } from 'src/infrastructure/firebase/firebase.config';

@Injectable()
export class TypingStatusService {
  private db = firebaseDatabase.ref('Hobbegram'); 

  async updateTypingStatus(chatId: string, userId: string, isTyping: boolean) {
    await this.db.child(`typingStatus/${chatId}/${userId}`).set(isTyping); 
  }

  async getTypingStatus(chatId: string) {
    const typingStatusSnapshot = await this.db.child(`typingStatus/${chatId}`).once('value');
    return typingStatusSnapshot.val();
  }
}
