import { ChatUser } from 'src/domain/entities/hobbe-chat/chat-user.entity';

export interface ChatUserRepository {
    create(userId: string,userName:string,profileName:string): Promise<ChatUser>;
    update(userId: string,userName:string,profileName:string): Promise<void>;
    findOne(userId: string): Promise<ChatUser>;
    delete(userId: string): Promise<void>;
    chatUserStatus(userId: string,isOnline:boolean): Promise<void>;
}
