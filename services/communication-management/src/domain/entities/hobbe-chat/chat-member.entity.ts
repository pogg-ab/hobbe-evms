import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Chat } from './chat.entity';

@Entity()
export class ChatMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  chatId: string;

  @ManyToOne(() => Chat, (chat) => chat.members, { onDelete: 'CASCADE' })
  chat: Chat[];
}
