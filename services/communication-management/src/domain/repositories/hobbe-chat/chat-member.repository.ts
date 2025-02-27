import { ChatMember } from 'src/domain/entities/hobbe-chat/chat-member.entity';

export interface ChatMemberRepository {
  addMember(chatId: string, userId: string, userName:string): Promise<ChatMember>;
  updateUserName(chat: ChatMember): Promise<ChatMember>;
  removeMember(chatId: string, userId: string): Promise<void>;
  findMember(chatId: string, userId: string): Promise<ChatMember | null>;
  getChatMembers(chatId: string): Promise<ChatMember[]>;
  getSingleChatMember(chatId: string, userId: string): Promise<ChatMember | null>;
  incrementUnreadCount(chatId: string, senderId: string): Promise<void>;
  resetUnreadCount(chatId: string, user: string): Promise<void>;
}
