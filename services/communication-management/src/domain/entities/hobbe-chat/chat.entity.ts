import { Column, CreateDateColumn, Entity, Index, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ChatMember } from './chat-member.entity';
import { Message } from './message.entity';
@Entity()
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['private', 'group'], default: 'private' })
  @Index() // Index for filtering by chat type
  type: string;

  @Column({ nullable: true })
  @Index() // Index for searching chats by name
  name: string;

  @OneToOne(() => Message, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lastMessageId' })
  lastMessage?: Message;

  @CreateDateColumn({ type: 'timestamptz' })
  @Index() // Index for sorting by creation date
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @OneToMany(() => ChatMember, (member) => member.chat,{ eager: true })
  members: ChatMember[];

  @OneToMany(() => Message, (message) => message.chat,{ eager: true })
  messages: Message[];
}
