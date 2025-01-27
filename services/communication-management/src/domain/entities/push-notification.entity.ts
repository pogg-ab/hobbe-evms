import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PushNotificationID } from '../value-objects/push-notification-id.value-object';

@Entity()
export class PushNotification {
  @PrimaryGeneratedColumn('uuid')
  id: PushNotificationID;

  @Column({ type: 'varchar', length: 255 })
  recipient: string;

  @Column('text')
  title: string;

  @Column('text')
  message: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  message_type: 'ALERT' | 'INFO' | 'UPDATE' | 'PROMOTIONAL' | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  platform: 'IOS' | 'ANDROID' | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  status: 'SENT' | 'FAILED' | 'PENDING' | null;

  @Column({ type: 'timestamp', nullable: true })
  sent_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at: Date | null;

  @Column({ type: 'int', nullable: true })
  priority: number | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  updated_by: string;
}
