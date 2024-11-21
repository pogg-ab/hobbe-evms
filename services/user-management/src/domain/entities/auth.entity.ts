// src/domain/entities/auth.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AuthID } from '../value-objects/auth-id.value-object';
import { UserID } from '../value-objects/user-id.value-object';
import { User } from './user.entity';

@Entity()
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  auth_id: AuthID;

  @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user_id: UserID;

  @Column({ type: 'text' })
  refresh_token: string;

  @Column({ type: 'text' })
  access_token: string;

  @Column({ type: 'timestamp' })
  token_expires_at: Date;

  @Column({ type: 'timestamp' })
  last_login: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
