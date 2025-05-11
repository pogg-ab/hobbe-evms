import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { FavoriteID } from '../value-objects/favorite-id.value-object';

@Entity()
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  favorite_id: FavoriteID;

  @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'favoriting_user_id' })
  favoriting_user: User;

  @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'favorited_user_id' })
  favorited_user: User;

  @CreateDateColumn()
  created_date: Date;
}
