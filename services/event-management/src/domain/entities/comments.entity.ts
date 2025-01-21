import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  import { Events } from './events.entity';
import { IdValueObject } from '../value-objects/event-id.value-object';
  
  @Entity()
  export class Comments {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    user_id: string; // Keep it as a reference, no foreign key
  

    @ManyToOne(() => Events, (event) => event.likes,{  onDelete: 'CASCADE', })
    @JoinColumn({ name: 'event_id' })
    event_id: IdValueObject;

    @Column({type: 'text'})
    comment: string;
  
    @Column({ type: 'timestamp',default: new Date() })
    created_at: Date;

    @Column({nullable: true})
    updated_by: string;

    @Column({ type: 'timestamp',nullable: true})
    updated_at: Date;
  }
  