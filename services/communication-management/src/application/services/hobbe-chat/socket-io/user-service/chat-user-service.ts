import { Inject, Injectable } from '@nestjs/common';
import { ChatUser } from 'src/domain/entities/hobbe-chat/chat-user.entity';
import { ChatUserRepository } from 'src/domain/repositories/hobbe-chat/chat-user.repository';
import { CHAT_USER_REPOSITORY_TOKEN } from 'src/domain/repositories/hobbe-chat/chat-user.repository.token';
import { E2eeService } from '../../e2ee/e2ee.service';

@Injectable()
export class ChatUserService {
  constructor(
   @Inject(CHAT_USER_REPOSITORY_TOKEN)
   private readonly chatUserRepository: ChatUserRepository,
   private readonly e2eeService: E2eeService
) {}
    
async chatUser(userId: string,profileId:string,profileName:string,profileImage:string): Promise<ChatUser> {   
     
     const user = await this.chatUserRepository.create(userId,profileId,profileName,profileImage);
     const doseUserHaveKey = await this.e2eeService.findOne(userId);
   
     if (!doseUserHaveKey) {  // Ensure key is created only if the user doesn't have one
       const keyPair = this.e2eeService.generateKeyPair();
       const keyData = {...keyPair, user_id: userId };
       await this.e2eeService.storeKeyPair(keyData);
     }
   
    //  console.log(doseUserHaveKey ? "Yes I Have a key" : "No Don't Have A key"); // This will now correctly show `null` or the existing key.
     return user;
   }

   async chatUserStatus(userId: string,isOnline:boolean): Promise<void> {     
      await this.chatUserRepository.chatUserStatus(userId,isOnline);
  }
   
}
