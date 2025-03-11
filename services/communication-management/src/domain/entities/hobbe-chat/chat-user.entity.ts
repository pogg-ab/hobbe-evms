import { Entity, PrimaryColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { ChatMember } from './chat-member.entity';
import { E2EE } from './e2ee.entity';

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


  @OneToOne(() => E2EE, (e2ee) => e2ee.user)
  key: E2EE;

  
}
