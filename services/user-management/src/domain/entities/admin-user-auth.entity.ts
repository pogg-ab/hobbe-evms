// src/domain/entities/admin-user-auth.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdminUserAuthID } from '../value-objects/admin-user-auth-id.value-object';
import { AdminUserID } from '../value-objects/admin-user-id.value-object';
import { AdminUser } from './admin-user.entity';

@Entity()
export class AdminUserAuth {
  @PrimaryGeneratedColumn('uuid')
  admin_user_auth_id: AdminUserAuthID;

  @ManyToOne(() => AdminUser, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_user_id' })
  admin_user_id: AdminUserID;

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
