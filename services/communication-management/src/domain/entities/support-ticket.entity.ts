import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SupportTicketID } from '../value-objects/support-ticket-id.value-object';

@Entity()
export class SupportTicket {
  @PrimaryGeneratedColumn('uuid')
  id: SupportTicketID;

  @Column({ type: 'varchar', length: 36 })
  user_id: string;

  @Column({ type: 'varchar' })
  freshdesk_ticket_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  created_by: string;
}
