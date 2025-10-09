import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdminUser } from './admin-user.entity';
import { AdminAlert } from './admin-alert.entity';

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

@Entity('admin_alert_subscriptions')
@Unique(['admin_id', 'alert_id', 'channel'])
export class AdminAlertSubscription {
  @PrimaryGeneratedColumn('uuid')
  subscription_id: string;

  @ManyToOne(() => AdminUser, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_id' })
  admin: AdminUser;

  @Column({ type: 'uuid' })
  admin_id: string;

  @ManyToOne(() => AdminAlert, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'alert_id' })
  alert: AdminAlert;

  @Column({ type: 'uuid' })
  alert_id: string;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
  })
  channel: NotificationChannel;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
