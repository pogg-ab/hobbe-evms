import { Message } from "src/domain/entities/hobbe-chat/message.entity";
import { CreateMessageDto } from "src/presentation/dto/hobbe-chat/create-message.dto";

export interface MessageRepository {
  sendMessage(user: string, createMessageDto: CreateMessageDto): Promise<Message>;
  getChatMessages(chatId: string): Promise<Message[]>;
  softDeleteMessage(messageId: string): Promise<void>;
}
