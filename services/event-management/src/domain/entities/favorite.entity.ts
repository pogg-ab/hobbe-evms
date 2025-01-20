import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  import { Events } from './events.entity';
  
  @Entity()
  export class Favorite {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    user_id: string; // Keep it as a reference, no foreign key
  

    @ManyToOne(() => Events, (event) => event.likes,{  onDelete: 'CASCADE', })
    @JoinColumn({ name: 'event_id' })
    event_id: Events;
  
    @Column({ type: 'timestamp' })
    created_at: Date;
  }
  