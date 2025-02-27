import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChatMember } from './chat-member.entity';
import { Message } from './message.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['private', 'group'],default: 'private'})
  type: string;

  @Column({ default: false,nullable: true })
  isGroup: boolean;

  @Column({ nullable: true })
  name: string;

  @OneToOne(() => Message, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lastMessageId' })
  lastMessage?: Message;


  @Column({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @OneToMany(() => ChatMember, (member) => member.chat)
  members: ChatMember[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
