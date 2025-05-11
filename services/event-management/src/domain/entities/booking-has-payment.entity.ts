import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TicketBooking } from './ticket-booking.entity';

@Entity()
export class BookingHasPayment {
  @PrimaryGeneratedColumn('uuid')
  booking_has_payment_id: string;

  @OneToOne(() => TicketBooking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking_id: TicketBooking;

  @Column()
  payment_method: string;

  @Column('numeric')
  total_amount: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  })
  status: 'pending' | 'paid' | 'failed';

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;
}
