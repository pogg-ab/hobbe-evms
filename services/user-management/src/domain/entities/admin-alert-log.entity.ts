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

  @ManyToOne(() => AdminAlert, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'alert_id' })
  alert: AdminAlert;

  @Column({ type: 'uuid' })
  alert_id: string;

  @Column({ nullable: true })
  related_entity_id: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: AdminAlertLogStatus,
    default: AdminAlertLogStatus.SENT,
  })
  status: AdminAlertLogStatus;

  @CreateDateColumn({ name: 'triggered_at' })
  triggered_at: Date;
}
