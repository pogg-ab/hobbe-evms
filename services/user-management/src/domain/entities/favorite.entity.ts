import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
} from 'typeorm';
import { User } from './user.entity';
import { FavoriteID } from '../value-objects/favorite-id.value-object';

@Entity()
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  favorite_id: FavoriteID;

  @ManyToOne(() => User, (user) => user.favorites, { eager: true })
  user: User;

  @ManyToOne(() => User, (user) => user.favoritedBy, { eager: true })
  favoriteUser: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}