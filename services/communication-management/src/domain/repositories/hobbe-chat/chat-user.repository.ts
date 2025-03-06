import { ChatUser } from 'src/domain/entities/hobbe-chat/chat-user.entity';

export interface ChatUserRepository {
    chatUser(userId: string): Promise<ChatUser>;
}
