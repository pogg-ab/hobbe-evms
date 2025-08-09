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
import { GuestSession } from './guest-session.entity';
import { SessionID } from '../value-objects/session-id.value-object';

@Entity()
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  auth_id: AuthID;

  @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user_id: UserID;

  @ManyToOne(() => GuestSession, { cascade: true, onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'session_id' })
  session_id: SessionID | null;

  @Column({ type: 'text' })
  refresh_token: string;

  @Column({ type: 'text' })
  access_token: string;

  @Column({ type: 'timestamp' })
  token_expires_at: Date;

  @Column({ type: 'timestamp' })
  last_login: Date;

  @Column({ type: 'boolean', default: false })
  is_guest: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
