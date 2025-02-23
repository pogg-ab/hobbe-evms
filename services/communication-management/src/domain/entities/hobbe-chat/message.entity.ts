import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Chat } from './chat.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  chatId: string;

  @Column()
  senderId: string;

  @Column('text')
  content: string;

  @Column({default:false})
  isDeleted: boolean;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @DeleteDateColumn({nullable:true})
  deletedAt: Date;

  @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
  chat: Chat;
}
