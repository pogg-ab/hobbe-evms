import { Message } from "src/domain/entities/hobbe-chat/message.entity";

export interface MessageRepository {
  sendMessage(chatId: string, senderId: string, content: string): Promise<Message>;
  getChatMessages(chatId: string): Promise<Message[]>;
  softDeleteMessage(messageId: string): Promise<void>;
}
