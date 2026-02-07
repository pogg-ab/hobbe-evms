import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';


export enum NotificationType {
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILURE = 'PAYMENT_FAILURE',
  EVENT_UPDATE = 'EVENT_UPDATE',
  EVENT_REMINDER = 'EVENT_REMINDER',
  TICKET_PURCHASE = 'TICKET_PURCHASE', 
  ADMIN_ALERT = 'ADMIN_ALERT',
  GENERAL = 'GENERAL', 
}


export enum NotificationStatus {
  READ = 'READ',
  UNREAD = 'UNREAD',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // This will store the ID of the user from the user-management service.
  @Column({ type: 'uuid' })
  user_id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD, // New notifications are always unread.
  })
  status: NotificationStatus;

  // This flexible column can store extra data, like an event_id or payment_id.
  @Column({
    type: 'jsonb', // 'jsonb' is a powerful PostgreSQL type for JSON data
    nullable: true,
  })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}