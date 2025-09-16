import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// We can reuse the NotificationType enum from our other entity.
// This ensures that our preferences are always in sync with our notification types.
import { NotificationType } from './notification.entity';

// Enum for the different delivery channels.
export enum NotificationChannel {
  IN_APP = 'IN_APP',
  PUSH = 'PUSH', // For mobile push notifications
  EMAIL = 'EMAIL',
  SMS = "SMS",
}

@Entity('notification_preferences')
// This is a very important constraint. It ensures that a user can only have
// ONE preference setting per type and channel (e.g., user '123' can only have
// one setting for 'EVENT_UPDATE' on the 'PUSH' channel).
@Unique(['user_id', 'notification_type', 'channel'])
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    name: 'notification_type', // Explicitly name the column in the DB
  })
  notification_type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
  })
  channel: NotificationChannel;

  @Column({ default: true })
  is_enabled: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}