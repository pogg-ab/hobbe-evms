// src/messages/message.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('messages')
@Index('idx_messages_sender_id', ['senderId'])
@Index('idx_messages_receiver_id', ['receiverId'])
@Index('idx_messages_sent_at', ['sentAt'])
@Index('idx_messages_convo', ['senderId', 'receiverId', 'sentAt'], { unique: false })
export class Message {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  senderId: number;

  @Column({ type: 'bigint' })
  receiverId: number;

  @Column('text')
  content: string;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  sentAt: Date;

  @Column({ type: 'varchar', length: 20, default: 'sent' })
  status: 'sent' | 'delivered' | 'read';
}