// src/domain/entities/admin-alert.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserAlertSubscription } from './user-alert-subscription.entity';

export enum AdminAlertType {
  SYSTEM = 'SYSTEM',
  TRANSACTION = 'TRANSACTION',
  USER_ACTIVITY = 'USER_ACTIVITY',
  EVENT_LIFECYCLE = 'EVENT_LIFECYCLE',
}

export enum AdminAlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('admin_alerts')
export class AdminAlert {
  @PrimaryGeneratedColumn('uuid')
  alert_id: string;

  @Column({ unique: true })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: AdminAlertType,
  })
  alert_type: AdminAlertType;

  @Column({
    type: 'enum',
    enum: AdminAlertSeverity,
  })
  severity: AdminAlertSeverity;

  @Column({ default: true })
  is_active: boolean;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'If true, this alert is a broadcast to all regular users',
  })
  is_broadcast: boolean;

  @OneToMany(() => UserAlertSubscription, (subscription) => subscription.alert)
  userSubscriptions: UserAlertSubscription[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
