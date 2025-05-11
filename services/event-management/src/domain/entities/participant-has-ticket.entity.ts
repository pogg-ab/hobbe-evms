import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TicketBooking } from './ticket-booking.entity';
import { Tickets } from './tickets.entity';

@Entity()
export class ParticipantHasTicket {
  @PrimaryGeneratedColumn('uuid')
  participant_has_ticket_id: string;

  @ManyToOne(() => TicketBooking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking_id: TicketBooking;

  @ManyToOne(() => Tickets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket_id: Tickets;

  @Column({ type: 'varchar', nullable: false })
  participant_id: string;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;
}
