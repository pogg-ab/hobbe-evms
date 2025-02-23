import { Chat } from 'src/domain/entities/hobbe-chat/chat.entity';

export interface ChatRepository {
  create(type: string, name?: string): Promise<Chat>;
  findById(chatId: string): Promise<Chat | null>;
  findPrivateChat(userId: string, friendId: string): Promise<Chat | null>;
  getUserChats(userId: string): Promise<Chat[]>;
  softDeleteChat(chatId: string): Promise<void>;
  delete(chatId: string): Promise<void>;
}
