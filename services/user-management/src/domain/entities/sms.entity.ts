import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
@Index('idx_sms_user_id', ['user_id'])
export class SMS {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 15 })
  recipient: string;

  @Column('text')
  message: string;

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

  @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  message_type: 'TEXT' | 'MMS' | 'OTP' | null;

  @Column({ type: 'int', nullable: true })
  priority: number | null;
}
