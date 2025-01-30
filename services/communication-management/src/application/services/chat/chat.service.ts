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

@Injectable()
export class ChatService {
  constructor(
    @Inject(CHAT_REPOSITORY_TOKEN)
    private readonly createChatRepository: IChatRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly e2eeService: E2eeService,
  ) {}
  private chatRef = firebaseDatabase.ref('chats'); // Realtime DB "chats" node

  async getMessages(chatRoom: string): Promise<Chat[]> {
    console.log({ user_id: chatRoom });

    const snapshot = await this.chatRef.child(chatRoom).once('value');
    const messages = snapshot.val();
    const privateKey = await this.e2eeService.getPrivateKey(chatRoom);

    Object.values(messages).forEach((message) => {
      const decryptedMessage = this.e2eeService.decrypt(
        privateKey.privateKey.toString(),
        message['text'].toString(),
      );
      message['text'] = decryptedMessage;
      // console.log(message['text']);
    });
    return messages;
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
    createChatDto.text = encryptedMessage;
    const mappedChat = this.mapper.map(createChatDto, CreateChatDto, Chat);
    mappedChat.sender_id = sender_id;

    const message = await this.createChatRepository.create(mappedChat);
    if (message) {
      const updatedMessage = {
        ...message,
        created_at: Timestamp.fromDate(new Date()),
      };
      await this.chatRef.child(message.room).push(updatedMessage);
    }
  }
}
