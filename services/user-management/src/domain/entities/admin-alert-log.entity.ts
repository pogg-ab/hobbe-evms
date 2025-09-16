import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AdminAlert } from './admin-alert.entity';

// Enum for the status of a logged alert instance.
export enum AdminAlertLogStatus {
  SENT = 'SENT',
  READ = 'READ',
  FAILED = 'FAILED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
}

@Entity('admin_alert_logs')
export class AdminAlertLog {
  @PrimaryGeneratedColumn('uuid')
  alert_log_id: string;

  // This creates the foreign key relationship to the admin_alerts table.
  @ManyToOne(() => AdminAlert, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'alert_id' })
  alert: AdminAlert;

  @Column({ type: 'uuid' })
  alert_id: string;

  // This can store the ID of the entity that caused the alert (e.g., a user_id or transaction_id).
  // It's a string because the entity could be in another microservice.
  @Column({ nullable: true })
  related_entity_id: string;

  @Column({ type: 'text' })
  message: string; // The specific message for this instance, e.g., "Event 'Rock Concert' is pending."

  @Column({
    type: 'enum',
    enum: AdminAlertLogStatus,
    default: AdminAlertLogStatus.SENT,
  })
  status: AdminAlertLogStatus;

  @CreateDateColumn({ name: 'triggered_at' })
  triggered_at: Date;
}