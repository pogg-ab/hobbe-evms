import { Injectable } from '@nestjs/common';
import { firebaseDatabase } from 'src/infrastructure/firebase/firebase.config';

@Injectable()
export class OnlineStatusService {
  private db = firebaseDatabase.ref('Hobbegram'); // Already a Reference object

  async updateOnlineStatus(userId: string, isOnline: boolean, lastSeen: number) {
    await this.db.child(`onlineStatus/${userId}`).set({ isOnline, lastSeen }); // Use `.child()` for the correct path
  }

  async getOnlineStatus(userId: string) {
    const onlineStatusSnapshot = await this.db.child(`onlineStatus/${userId}`).once('value'); // Using `.child()` to access the correct path
    return onlineStatusSnapshot.val();
  }
}
