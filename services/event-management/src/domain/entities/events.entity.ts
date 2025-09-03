import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IdValueObject } from '../value-objects/event-id.value-object';
import { Promocodes } from './promocodes.entity';
import { TicketsHeading } from './tickets-heading.entity';
import { Tickets } from './tickets.entity';
import { Like } from './likes.entity';
import { TicketBooking } from './ticket-booking.entity';
import { Comments } from './comments.entity';
import { FavoriteEvent } from './favorite-event.entity';
import { EventShare } from './event-share.entity';

@Entity()
export class Events {
  @PrimaryGeneratedColumn('uuid')
  id: IdValueObject;

  @Column()
  user_id: string;

  @Column()
  title: string;

  @Column()
  thumbnail: string;

  @Column({ nullable: true })
  cover_image: string;

  @Column()
  event_type: string;

  @Column({ type: 'boolean', default: true })
  isPaid: boolean;

  @Column({ type: 'boolean', default: false })
  hasPromocode: boolean;

  @Column({ type: 'text' })
  description: string;

  @Column()
  location: string;

  @Column()
  latitude: string;

  @Column()
  longitude: string;

  @Column({ enum: ['public', 'private', 'group'] })
  privacy: string;

  @Column({
    default: 'drafted',
    enum: [
      'drafted',
      'pending',
      'cancelled',
      'rejected',
      'postponed',
      'active',
    ],
  })
  status: string;

  @Column({ type: 'timestamptz' })
  event_start_date: Date;

  @Column({ type: 'timestamptz' })
  event_end_date: Date;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  // @Column({ nullable: true })
  // category: string;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  update_by: string;

  @Column({ type: 'timestamptz', nullable: true })
  created_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  updated_at: Date;

  @Column('text', { array: true })
  categories: string[];

  @OneToOne(() => TicketsHeading, (ticket) => ticket.event_id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  ticket_heading: TicketsHeading;

  @OneToMany(() => Tickets, (ticket) => ticket.event_id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  tickets: Tickets[];

  @OneToMany(() => Promocodes, (promocode) => promocode.event_id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  promocodes: Promocodes[];

  @OneToMany(() => Like, (like) => like.event_id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  likes: Like[];

  @OneToMany(() => FavoriteEvent, (favorite) => favorite.event_id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  favorites: FavoriteEvent[];

  @OneToMany(() => EventShare, (share) => share.event_id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  shares: EventShare[];

  @OneToMany(() => Comments, (comment) => comment.event_id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  comments: Comments[];

  @OneToMany(() => TicketBooking, (booking) => booking.event_id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  bookings: TicketBooking[];
}
