import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IdValueObject } from "../value-objects/event-id.value-object";
import { TicketsHeading } from "./tickets-heading.entity";
import { Events } from "./events.entity";


@Entity()

export class Promocodes{
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    code: string;

    @Column({ type: 'decimal'})
    quantity: number;

    @Column({ type: 'decimal'})
    discount: number;

    @Column({ type: 'decimal'})
    available_quantity: number;

    @Column({ nullable: true })
    promo_start_date: Date;
  
    @Column({nullable:true})
    promo_end_date: Date;

    @Column({default:'Active', 
        enum:['Active','Used','Expire']
     })
     status: string;


     @ManyToOne(()=>Events,(event)=> event.id,{cascade:true})
     @JoinColumn({ name: 'event_id'})
     event_id: string;

     @ManyToOne(()=>TicketsHeading,(heading)=> heading.id,{cascade:true})
     @JoinColumn({ name: 'ticket_heading_id'})
     ticket_heading_id: string;

     @Column({nullable:true})
     description:string
}