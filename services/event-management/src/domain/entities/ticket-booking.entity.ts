import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IdValueObject } from '../value-objects/event-id.value-object';
import { Events } from './events.entity';

@Entity()
export class TicketBooking {
  @PrimaryGeneratedColumn('uuid')
  booking_id: string;

  @Column({
    type: 'enum',
    enum: ['Regular', 'VIP', 'VVIP'],
    default: 'Regular',
  })
  booking_type: 'Regular' | 'VIP' | 'VVIP';

  @ManyToOne(() => Events, (event) => event.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event_id: IdValueObject;

  @Column({ type: 'numeric' })
  total_amount: number;

  @Column({ type: 'varchar' })
  user_id: string;

  @Column({ type: 'varchar', default: 'pending' })
  booking_status: string;

  @Column({ type: 'boolean', default: false })
  hasGift: boolean;

  @Column({ type: 'boolean', default: false })
  hasPromocode: boolean;

  @Column({ type: 'boolean', default: false })
  hasPayment: boolean;

  @Column({ type: 'boolean', default: false })
  is_partnership: boolean;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp' })
  updated_at: Date;
}
