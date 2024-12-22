import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TicketBooking } from './ticket-booking.entity';

export enum PartnershipStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  COMPLETED = 'completed',
  CONFIRMED = 'confirmed',
}

@Entity('partnerships')
export class Partnership {
  @PrimaryGeneratedColumn('uuid')
  partnership_id: string;

  @Column({ type: 'varchar', nullable: false })
  event_organizer: string;

  @Column({ type: 'varchar', nullable: false })
  ticket_buyer: string;

  @OneToOne(() => TicketBooking, (booking) => booking.booking_id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking_id: TicketBooking;

  @Column({
    type: 'enum',
    enum: PartnershipStatus,
    default: PartnershipStatus.PENDING,
  })
  status: PartnershipStatus;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
