import { Column, Entity, IsNull, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IdValueObject } from "../value-objects/event-id.value-object";
import { Events } from "./events.entity";
import { TicketsList } from "./tickets_list.entity";


@Entity()
export class Tickets {
    @PrimaryGeneratedColumn('uuid')
    id: IdValueObject;

    @Column()
    name: string;

    @Column({type:'text',nullable:true})
    description: string;

    @Column({type:'text'})
    schedule: string;

    @Column()
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;


    @Column()
    sales_start: Date;
    
    @Column()
    sales_end: Date;
    
    @Column({default:'pending', enum: ['pending', 'active', 'cancelled','Expired'] })
    status: string;


    @Column({nullable: true })
    created_by: string;

    @Column({nullable: true  })
    update_by: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable:true })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: true })
    updated_at: Date;

    @OneToOne(() => Events, (event) => event.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'event_id' })
    event_id: Events;


    @OneToMany(()=> TicketsList,(tickets) => tickets.ticket_id,{ cascade: true })

    ticket_list: TicketsList[];
}