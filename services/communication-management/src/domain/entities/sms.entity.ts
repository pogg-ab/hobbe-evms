import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SMSID } from '../value-objects/sms-id.value-object';

@Entity()
export class SMS {
  @PrimaryGeneratedColumn('uuid')
  id: SMSID;

  @Column({ type: 'varchar', length: 15 })
  recipient: string;

  @Column('text')
  message: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  message_type: 'TEXT' | 'MMS' | 'OTP' | null;

  @Column({ type: 'int', nullable: true })
  priority: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  status: 'SENT' | 'FAILED' | 'PENDING' | null;

  @Column({ type: 'timestamp', nullable: true })
  sent_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  delivery_report_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  updated_by: string;
}
