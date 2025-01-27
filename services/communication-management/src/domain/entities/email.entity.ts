import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmailID } from '../value-objects/email-id.value-object';

@Entity()
export class Email {
  @PrimaryGeneratedColumn('uuid')
  email_id: EmailID;

  @Column()
  recipient: string;

  @Column()
  subject: string;

  @Column('text')
  body: string;

  @Column({ type: 'timestamp', nullable: true })
  sent_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  updated_by: string;
}
