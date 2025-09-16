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

// We can reuse the channel enum from our communication service,
// but it's often better practice to redefine it here to keep the service decoupled.
export enum NotificationChannel {
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

@Entity('admin_alert_subscriptions')
// This composite unique key is critical. It ensures an admin can only have
// one subscription for a specific alert on a specific channel.
@Unique(['admin_id', 'alert_id', 'channel'])
export class AdminAlertSubscription {
  @PrimaryGeneratedColumn('uuid')
  subscription_id: string;

  // Foreign key to the admin_user table
  @ManyToOne(() => AdminUser, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_id' })
  admin: AdminUser;

  @Column({ type: 'uuid' })
  admin_id: string;

  // Foreign key to the admin_alerts table
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
  is_active: boolean; // Allows an admin to temporarily disable a subscription

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}