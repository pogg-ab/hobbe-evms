import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { IdValueObject } from '../value-objects/event-id.value-object';
import { Events } from './events.entity'; // Importing the Events entity

export enum SpecialGuestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity()
export class SpecialGuest {
  @PrimaryGeneratedColumn('uuid')
  special_guest_id: IdValueObject;

  @ManyToOne(() => Events, (event) => event.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event_id: IdValueObject;

  @Column('uuid')
  guest_user_id: string;

  @Column({ type: 'timestamp' })
  invited_at: string;

  @Column({
    type: 'enum',
    enum: SpecialGuestStatus,
    default: SpecialGuestStatus.PENDING,
  })
  status: SpecialGuestStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ nullable: true })
  created_by: string;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ nullable: true })
  updated_by: string;
}
