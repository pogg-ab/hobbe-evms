// src/domain/entities/user-alert-subscription.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { AdminAlert } from './admin-alert.entity';

@Entity('user_alert_subscriptions')
@Unique(['user_id', 'alert_id'])
export class UserAlertSubscription {
  @PrimaryGeneratedColumn('uuid')
  subscription_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  alert_id: string;

  @ManyToOne(() => AdminAlert, (alert) => alert.userSubscriptions)
  @JoinColumn({ name: 'alert_id' })
  alert: AdminAlert;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
