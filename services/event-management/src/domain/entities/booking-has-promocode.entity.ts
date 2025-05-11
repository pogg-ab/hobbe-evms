import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Promocodes } from './promocodes.entity';
import { TicketBooking } from './ticket-booking.entity';

@Entity()
export class BookingHasPromocode {
  @PrimaryGeneratedColumn('uuid')
  booking_has_promocode_id: string;

  @ManyToOne(() => Promocodes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'promocode_id' })
  promocode_id: Promocodes;

  @OneToOne(() => TicketBooking, (booking) => booking.booking_id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking_id: TicketBooking;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;
}
