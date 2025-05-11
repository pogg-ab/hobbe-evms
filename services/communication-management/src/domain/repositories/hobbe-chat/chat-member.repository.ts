import { ChatMember } from 'src/domain/entities/hobbe-chat/chat-member.entity';
import { ChatUser } from 'src/domain/entities/hobbe-chat/chat-user.entity';
import { Chat } from 'src/domain/entities/hobbe-chat/chat.entity';

export interface ChatMemberRepository {
  addMember(chat: Chat, user: ChatUser): Promise<ChatMember>;
  updateUserName(chat: Chat): Promise<ChatMember>;
  removeMember(chat: Chat, user: ChatUser): Promise<void>;
  findMember(chat: Chat, user: ChatUser): Promise<ChatMember | null>;
  getChatMembers(chat: Chat): Promise<ChatMember[]>;
  getSingleChatMember(chat: Chat, user: ChatUser): Promise<ChatMember | null>;
  incrementUnreadCount(chat: Chat, user: ChatUser): Promise<void>;
  resetUnreadCount(chat: Chat, user: ChatUser): Promise<void>;
}
