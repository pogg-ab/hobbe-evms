import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  import { Events } from './events.entity';  // Import Events Entity
  import { IdValueObject } from '../value-objects/event-id.value-object';
  
  @Entity()
  export class EventShare {
    @PrimaryGeneratedColumn('uuid')
    id: string; // Unique identifier for the share event
  
    @Column()
    user_id: string; // The user who shared the event
  
    @ManyToOne(() => Events, (event) => event.shares, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'event_id' })
    event_id: IdValueObject;  // Event being shared
  
    @Column('text')
    shared_with_users: string[]; // List of user IDs with whom the event is shared (can be serialized as an array)
  
    @Column({ type: 'timestamp', default: new Date() })
    shared_at: Date; // Time when the event was shared
  
    @Column({ type: 'timestamp', nullable: true })
    updated_at: Date; // Timestamp for when the share details were updated
  }
  