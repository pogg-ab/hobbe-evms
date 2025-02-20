import { Injectable } from '@nestjs/common';
import { firebaseDatabase } from 'src/infrastructure/firebase/firebase.config';

@Injectable()
export class UserService {

  private db = firebaseDatabase.ref('Hobbegram'); 

  async createUser(userId: string, userData: any) {
    await this.db.child(`users/${userId}`).set(userData);
  }

  async getUser(userId: string) {
    const userSnapshot = await this.db.child(`users/${userId}`).once('value'); 
    return userSnapshot.val();
  }

  async updateUser(userId: string, userData: any) {
    await this.db.child(`users/${userId}`).update(userData); 
  }
}
