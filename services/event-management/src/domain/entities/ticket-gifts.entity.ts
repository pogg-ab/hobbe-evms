import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IdValueObject } from '../value-objects/event-id.value-object';
import { TicketBooking } from './ticket-booking.entity';

@Entity()
export class TicketGifts {
  @PrimaryGeneratedColumn('uuid')
  gift_id: IdValueObject;

  @OneToOne(() => TicketBooking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking_id: IdValueObject;

  @Column({ nullable: true })
  gifter_id: string;

  @Column({ nullable: true })
  recipient_id: string;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;
}
