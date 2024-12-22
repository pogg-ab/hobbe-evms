import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IdValueObject } from '../value-objects/event-id.value-object';
import { Events } from './events.entity';
import { Tickets } from './tickets.entity';

@Entity()
export class Promocodes {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  code: string;

  @Column({ type: 'decimal' })
  quantity: number;

  @Column({ type: 'decimal' })
  discount: number;

  @Column({ type: 'decimal', default: 0 })
  used_promocode: number;

  @Column({ nullable: true })
  promo_start_date: Date;

  @Column({ nullable: true })
  promo_end_date: Date;

  @Column({ default: 'Active', enum: ['Active', 'Used', 'Expire', 'Deactive'] })
  status: string;

  @ManyToOne(() => Events, (event) => event.id)
  @JoinColumn({ name: 'event_id' })
  event_id: Events;

  //  @ManyToOne(()=>TicketsHeading,(heading)=> heading.id)
  //  @JoinColumn({ name: 'ticket_heading_id'})
  //  ticket_heading_id?: IdValueObject;

  @OneToMany(() => Tickets, (ticket) => ticket.id, { nullable: true })
  ticket_id?: IdValueObject[];

  @Column({ nullable: true, type: 'text' })
  description: string;
}
