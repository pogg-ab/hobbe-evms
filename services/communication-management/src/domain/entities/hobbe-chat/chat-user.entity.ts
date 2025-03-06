import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { ChatMember } from './chat-member.entity';

@Entity('chat-users')
export class ChatUser {
  @PrimaryColumn()
  id: string; // Manually assigned ID

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ default: false })
  isOnline: boolean;

  @Column({type: 'timestamptz', nullable: true })
  lastSeenAt?: Date;

  @Column({type: 'timestamptz' ,default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => ChatMember, (chatMember) => chatMember.user)
  chatMembers: ChatMember[];
}
