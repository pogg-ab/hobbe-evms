import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/domain/entities/hobbe-chat/message.entity';
import { MessageRepository } from 'src/domain/repositories/hobbe-chat/message.repository';
import { CreateMessageDto } from 'src/presentation/dto/hobbe-chat/create-message.dto';
import { Repository } from 'typeorm';


@Injectable()
export class MessageRepositoryImpl implements MessageRepository {
  constructor(@InjectRepository(Message) private readonly messageRepo: Repository<Message>) {}

  async sendMessage(user: string, createMessageDto:CreateMessageDto): Promise<any> {
    const create_message = {...createMessageDto, senderId: user};
    const createMessage = this.messageRepo.create(create_message);
     const storeMessage =  await this.messageRepo.save(createMessage);

     const message = await this.messageRepo.findOne({
      where: { id: storeMessage.id },
      relations: [
        'chat',          
        'chat.members', 
      ],
    });

    if (!message || !message.chat || !message.chat.members) {
      throw new Error('Message or chat members not found');
    }
    
    const sender = message.chat.members.find(member => member.userId === message.senderId);
    const receiver = message.chat.members.find(member => member.userId !== message.senderId);
    
    const formattedMessage = {
      id: message.id,
      chatId: message.chatId,
      content: message.content,
      createdAt: message.createdAt,
      sender,
      receiver,
    };

    return formattedMessage;
  }

  async getChatMessages(chatId: string): Promise<Message[]> {
    return this.messageRepo.find({ where: { chatId }, order: { createdAt: 'ASC' } });
  }

  async softDeleteMessage(messageId: string): Promise<void> {
    await this.messageRepo.softDelete(messageId);
  }
}
