import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Chat } from './chat.entity';
import { ChatUser } from './chat-user.entity';

@Entity()
export class ChatMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    @Index()
    joinedAt: Date;

    @Column({ type: 'int', default: 0 })
    unreadCount: number;

    // Consider adding these if you need reverse lookups
    @Column()
    userId: string;  // Explicit column for easier querying

    @Column()
    chatId: string;  // Explicit column for easier querying

    @ManyToOne(() => ChatUser, (user) => user.chatMembers)
    @JoinColumn({ name: 'userId' })
    @Index('idx_chatmember_userid')
    user: ChatUser;

    @ManyToOne(() => Chat, (chat) => chat.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'chatId' })
    @Index('idx_chatmember_chatid')
    chat: Chat;

    // Optional: Add status if members can be active/inactive
    @Column({ type: 'boolean', default: true })
    isActive?: boolean;
}