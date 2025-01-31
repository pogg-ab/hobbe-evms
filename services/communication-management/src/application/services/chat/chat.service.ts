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
import { log } from 'console';

@Injectable()
export class ChatService {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN)
    private readonly createChatRepository: IChatRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly e2eeService: E2eeService,
  ) {}
  // private chatRef = firebaseDatabase.ref('chats'); // Realtime DB "chats" node
  private chatRef = firebaseDatabase.ref('HobbeChats'); // Realtime DB "chats" node

  async getMessages(user: any, sender: string): Promise<any[]> {
    const snapshot = await this.chatRef
      .child(user.user.user_id.toString())
      .child(sender)
      .once('value');
    const messages = snapshot.val();
    if (messages) {
      const senderPrivateKey = await this.e2eeService.getPrivateKey(
        sender,
      );

      const receiverPrivateKey = await this.e2eeService.getPrivateKey(
        user.user.user_id.toString(),
      );

      Object.values(messages).forEach((message) => {
        const classedMessage = [message]
        classedMessage.forEach((msg) => {
          if(msg['direction'] == 'in'){
            const decryptedMessage = this.e2eeService.decrypt(
              receiverPrivateKey.privateKey.toString(),
              msg['text'].toString(),
            );
            msg['text'] = decryptedMessage;
          }

          if(msg['direction'] == 'out'){
            const decryptedMessage = this.e2eeService.decrypt(
              senderPrivateKey.privateKey.toString(),
              msg['text'].toString(),
            );
            msg['text'] = decryptedMessage;
          }
          
          // console.log(message['text']);
        });
      });
      

      return { ...messages, sender: user.user.user_name };
    }
  }

  async createMessage(
    sender_id: string,
    createChatDto: CreateChatDto,
  ): Promise<any> {
    const publicKey = await this.e2eeService.getPublicKey(createChatDto.to);
    const encryptedMessage = this.e2eeService.encrypt(
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
    await this.chatRef
      .child(createChatDto.to)
      .child(sender_id)
      .push({ ...messageToSent, direction: 'in' });

    // sent
    await this.chatRef
      .child(sender_id)
      .child(createChatDto.to)
      .push({ ...messageToSent, direction: 'out' });
  }

  async findOne(user: string, id: string) {
    const snapshot = await this.chatRef.child(user).child(id).once('value');
    const data = snapshot.val();

    if (!data) {
      return { message: 'Message not found', user, id };
    }

    return { id: id, ...data };
  }

  async updateMessage(
    user: string,
    chat_id: string,
    text: string,
  ): Promise<any> {
    const chat = await this.findOne(user, chat_id);
    return chat;
  }
}
