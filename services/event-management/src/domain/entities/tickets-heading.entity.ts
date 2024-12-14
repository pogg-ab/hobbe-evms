import {
  Column,
  Entity,
  IsNull,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IdValueObject } from '../value-objects/event-id.value-object';
import { Events } from './events.entity';
import { Tickets } from './tickets.entity';
import { Promocodes } from './promocodes.entity';

@Entity()
export class TicketsHeading {
  @PrimaryGeneratedColumn('uuid')
  id: IdValueObject;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text' })
  schedule: string;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  min_order: number;

  @Column()
  max_order: number;

  @Column({ nullable: true })
  vip_quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 ,nullable:true})
  vip_price: number;

  @Column({ nullable: true })
  vip_min_order: number;

  @Column({ nullable: true })
  vip_max_order: number;

  @Column({ nullable: true })
  vvip_quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 ,nullable:true})
  vvip_price: number;

  @Column({ nullable: true })
  vvip_min_order: number;

  @Column({ nullable: true })
  vvip_max_order: number;

  @Column({ nullable: true })
  sales_start: Date;

  @Column()
  sales_end: Date;

  @Column({
    default: 'pending',
    enum: ['pending', 'active', 'cancelled', 'Expired'],
  })
  status: string;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  update_by: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  updated_at: Date;

  @OneToOne(() => Events, (event) => event.id)
  @JoinColumn({ name: 'event_id' })
  event_id: Events;

  @OneToMany(() => Tickets, (tickets) => tickets.ticket_heading_id, {
    cascade: true, 
    onDelete: 'CASCADE',
    nullable:true
  })
  @JoinColumn({ name: 'ticket_heading_id' })
  tickets?: Tickets[];

  @OneToMany(() => Promocodes, (promocode) => promocode.id,{nullable:true})
  promocode_id?: Promocodes[];
}
