import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class MessageStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  messageId: string;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: ['sent', 'delivered', 'seen'] })
  status: 'sent' | 'delivered' | 'seen';

  @ManyToOne(() => Message, { onDelete: 'CASCADE' })
  message: Message;
}
