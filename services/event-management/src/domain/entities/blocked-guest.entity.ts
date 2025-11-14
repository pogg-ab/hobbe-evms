import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ParticipantHasTicket } from './participant-has-ticket.entity';

@Entity()
export class BlockedGuest {
  @PrimaryGeneratedColumn('uuid')
  block_id: string;

  @ManyToOne(() => ParticipantHasTicket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participant_id' })
  participant: ParticipantHasTicket;

  @Column({ type: 'uuid' })
  event_id: string;

  @Column({ type: 'varchar', nullable: true })
  reason: string;

  @Column({ type: 'uuid', nullable: true })
  blocked_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
