import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IdValueObject } from '../value-objects/event-id.value-object';
import { Events } from './events.entity';
export enum EventSponsorStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity()
export class EventSponsor {
  @PrimaryGeneratedColumn('uuid')
  event_sponsor_id: IdValueObject;

  @ManyToOne(() => Events, (event) => event.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  event: Events;

  @Column('uuid')
  sponsor_user_id: string;

  @Column({ type: 'timestamp' })
  sponsored_at: Date;

  @Column({
    type: 'enum',
    enum: EventSponsorStatus,
    default: EventSponsorStatus.PENDING,
  })
  status: EventSponsorStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ nullable: true })
  created_by: string;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ nullable: true })
  updated_by: string;
}
