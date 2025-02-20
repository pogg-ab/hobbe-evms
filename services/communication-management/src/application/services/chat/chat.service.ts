import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { Chat } from 'src/domain/entities/chat.entity';
import { IChatRepository } from 'src/domain/repositories/chat/chat.repository';
import { CHAT_REPOSITORY_TOKEN } from 'src/domain/repositories/chat/chat.repository.token';
import { CreateChatDto } from 'src/presentation/dto/chat/create-chat.dto';
import { firebaseDatabase } from '../../../infrastructure/firebase/firebase.config';
import { E2eeService } from '../e2ee/e2ee.service';
import { Timestamp } from 'firebase/firestore';
import { UpdateChatDto } from 'src/presentation/dto/chat/update-chat.dto';
import { RemoveChatDto } from 'src/presentation/dto/chat/remove-chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN)
    private readonly createChatRepository: IChatRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly e2eeService: E2eeService,
  ) {}
  // private chatRef = firebaseDatabase.ref('chats'); // Realtime DB "chats" node
  private chatRef = firebaseDatabase.ref('HobbeChats'); 



  async start(user:any):Promise<any>{
    const publicKey = await this.e2eeService.getPublicKey(user.user.user_id.toString());
    await this.chatRef.child(user.user.user_id.toString()).set(
        {account_info: {
          username: user.user.user_name,
          account_type: user.user.account_type,
          is_active: user.user.is_active,
         },
       }
       );
    return 'chat started successfully'
  }

  async home(user:any){
    const snapshot = await this.chatRef
    .child(user.user.user_id.toString())
    .once('value');
  const data = snapshot.val();
  const messages = {};

  // Iterate over all message IDs (excluding account_info)
  for (const messageId in data) {
    if (messageId !== 'account_info') {
      const friendPrivateKey = await this.e2eeService.getPrivateKey(messageId);
      const receiverPrivateKey = await this.e2eeService.getPrivateKey(user.user.user_id.toString());
     
      const lastMessage = data[messageId]?.lastMessage;
      if (lastMessage) {
       
          if (lastMessage['direction'] == 'in') {
          const decryptedMessage = this.e2eeService.decrypt(receiverPrivateKey.privateKey.toString(),
            lastMessage['text'].toString(),
          );
          lastMessage['text'] = decryptedMessage;
          messages[messageId] = { lastMessage };

        }

        if ( lastMessage['direction'] == 'out') {
          const decryptedMessage = this.e2eeService.decrypt( friendPrivateKey.privateKey.toString(),
            lastMessage['text'].toString(),
          );
          lastMessage['text'] = decryptedMessage;
          messages[messageId] = { lastMessage };

        }
      }
    }
  }
  // if (messages) {
  //   const friendPrivateKey = await this.e2eeService.getPrivateKey(friend);
  //   const receiverPrivateKey = await this.e2eeService.getPrivateKey(
  //     user.user.user_id.toString(),
  //   );

  //   Object.values(messages.messages).forEach((message) => {
  //     const classedMessage = [message];
  //     classedMessage.forEach((msg) => {
  //       if (msg['direction'] == 'in') {
  //         const decryptedMessage = this.e2eeService.decrypt(
  //           receiverPrivateKey.privateKey.toString(),
  //           msg['text'].toString(),
  //         );
  //         msg['text'] = decryptedMessage;
  //       }

  //       if (msg['direction'] == 'out') {
  //         const decryptedMessage = this.e2eeService.decrypt(
  //           friendPrivateKey.privateKey.toString(),
  //           msg['text'].toString(),
  //         );
  //         msg['text'] = decryptedMessage;
  //       }

  //       // console.log(message['text']);
  //     });
  //   });


  //   if (messages.lastMessage['direction'] == 'in') {
  //     const decryptedMessage = this.e2eeService.decrypt(
  //       receiverPrivateKey.privateKey.toString(),
  //       messages.lastMessage['text'].toString(),
  //     );
  //     messages.lastMessage['text'] = decryptedMessage;
  //   }

  //   if ( messages.lastMessage['direction'] == 'out') {
  //     const decryptedMessage = this.e2eeService.decrypt(
  //       friendPrivateKey.privateKey.toString(),
  //       messages.lastMessage['text'].toString(),
  //     );
  //     messages.lastMessage['text'] = decryptedMessage;
  //   }
    return messages;
  }
  

  async createMessage(
    sender_id: string,
    createChatDto: CreateChatDto,
  ): Promise<any> {
    const publicKey = await this.e2eeService.getPublicKey(createChatDto.to);
    const encryptedMessage =  this.e2eeService.encrypt(
      publicKey.publicKey.toString(),
      createChatDto.text,
    );

    const messageToSent = {
      text: encryptedMessage,
      created_at: Timestamp.fromDate(new Date()),
      status: {
        seen_at: '',
        updated_at: '',
      },
    };

    // Generate a single message key
    const newMessageRef = await this.chatRef
      .child(createChatDto.to)
      .child(sender_id)
      .child('messages')
      .push();

     
    const messageKey = newMessageRef.key; // Get the generated message ID

    const sentMessage = { ...messageToSent, direction: 'out' };
    const recivedMessage = { ...messageToSent, direction: 'in' };
    await this.chatRef.child(createChatDto.to).child(sender_id).child("lastMessage").set(recivedMessage);
    await this.chatRef.child(sender_id).child(createChatDto.to).child("lastMessage").set(sentMessage);

    // Save message with the same key in both chat rooms
    const updates = {};
    updates[`${createChatDto.to}/${sender_id}/messages/${messageKey}`] = recivedMessage;
    updates[`${sender_id}/${createChatDto.to}/messages/${messageKey}`] = sentMessage;

  
    await this.chatRef.update(updates);
  }


  async getMessages(user: any, friend: string): Promise<any[]> {
    const snapshot = await this.chatRef
      .child(user.user.user_id.toString())
      .child(friend)
      // .child('messages')
      .once('value');
    const messages = snapshot.val();
    if (messages) {
      const friendPrivateKey = await this.e2eeService.getPrivateKey(friend);
      const receiverPrivateKey = await this.e2eeService.getPrivateKey(
        user.user.user_id.toString(),
      );

      Object.values(messages.messages).forEach((message) => {
        const classedMessage = [message];
        classedMessage.forEach((msg) => {
          if (msg['direction'] == 'in') {
            const decryptedMessage = this.e2eeService.decrypt(
              receiverPrivateKey.privateKey.toString(),
              msg['text'].toString(),
            );
            msg['text'] = decryptedMessage;
          }

          if (msg['direction'] == 'out') {
            const decryptedMessage = this.e2eeService.decrypt(
              friendPrivateKey.privateKey.toString(),
              msg['text'].toString(),
            );
            msg['text'] = decryptedMessage;
          }

          // console.log(message['text']);
        });
      });


      if (messages.lastMessage['direction'] == 'in') {
        const decryptedMessage = this.e2eeService.decrypt(
          receiverPrivateKey.privateKey.toString(),
          messages.lastMessage['text'].toString(),
        );
        messages.lastMessage['text'] = decryptedMessage;
      }

      if ( messages.lastMessage['direction'] == 'out') {
        const decryptedMessage = this.e2eeService.decrypt(
          friendPrivateKey.privateKey.toString(),
          messages.lastMessage['text'].toString(),
        );
        messages.lastMessage['text'] = decryptedMessage;
      }
      return { ...messages, sender: user.user.user_name };
    }
  }
  async findOne(user: any, friend: string, id: string) {
    const snapshot = await this.chatRef
      .child(user.user.user_id.toString())
      .child(friend)
      .child(id)
      .once('value');
    const message = snapshot.val();
    if (message) {
      const friendPrivateKey = await this.e2eeService.getPrivateKey(friend);
      const receiverPrivateKey = await this.e2eeService.getPrivateKey(
        user.user.user_id.toString(),
      );

      if (message['direction'] == 'in') {
        const decryptedMessage = this.e2eeService.decrypt(
          receiverPrivateKey.privateKey.toString(),
          message['text'].toString(),
        );
        message['text'] = decryptedMessage;
      }

      if (message['direction'] == 'out') {
        const decryptedMessage = this.e2eeService.decrypt(
          friendPrivateKey.privateKey.toString(),
          message['text'].toString(),
        );
        message['text'] = decryptedMessage;
      }

      return { id: id, ...message };
    }
  }

  async updateMessage(user: any, chat: UpdateChatDto): Promise<any> {
    const snapshot1 = await this.chatRef
      .child(user.user.user_id.toString())
      .child(chat.friend)
      .child(chat.chat_id)
      .once('value');

    const snapshot2 = await this.chatRef
      .child(user.user.user_id.toString())
      .child(chat.friend)
      .child(chat.chat_id)
      .once('value');
    const message = snapshot1.val();
    if (message) {
      const publicKey = await this.e2eeService.getPublicKey(chat.friend);
      const encryptedUpdatedMessage = this.e2eeService.encrypt(
        publicKey.publicKey.toString(),
        chat.text,
      );
      message.text = encryptedUpdatedMessage;
      message.status.updated_at = Timestamp.fromDate(new Date());
      await this.chatRef
        .child(user.user.user_id.toString())
        .child(chat.friend)
        .child(chat.chat_id)
        .update(message);

      // update receiver side

      const snapshot2 = await this.chatRef
        .child(chat.friend)
        .child(user.user.user_id.toString())
        .child(chat.chat_id)
        .once('value');
      const message2 = snapshot2.val();
      if (message2) {
        const publicKey = await this.e2eeService.getPublicKey(
          user.user.user_id.toString(),
        );
        const encryptedUpdatedMessage = this.e2eeService.encrypt(
          publicKey.publicKey.toString(),
          chat.text,
        );
        message2.text = encryptedUpdatedMessage;
        message2.status.updated_at = Timestamp.fromDate(new Date());
        await this.chatRef
          .child(chat.friend)
          .child(user.user.user_id.toString())
          .child(chat.chat_id)
          .update(message);

        return message;
      }
    }
  }

  async removeMessage(user: any, chat: RemoveChatDto): Promise<any> {
   const message = await this.chatRef
    .child(user.user.user_id.toString())
    .child(chat.friend)
    .child(chat.chat_id)
    .remove();


    if(chat.removeFromBothSide){
     await this.chatRef
     .child(chat.friend)
     .child(user.user.user_id.toString())
     .child(chat.chat_id)
     .remove();
    }

    return {message:'Deleted ?'}
    
  }
}
