import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Events } from './events.entity';

@Entity()
export class FavoriteEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;


  @ManyToOne(() => Events, (event) => event.likes, { onDelete: 'CASCADE', })
  @JoinColumn({ name: 'event_id' })
  event_id: Events;

  @Column({ type: 'timestamp' })
  created_at: Date;
}
