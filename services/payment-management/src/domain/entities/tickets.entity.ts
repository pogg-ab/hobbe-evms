import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IdValueObject } from "../value-objects/event-id.value-object";
import { TicketsHeading } from "./tickets-heading.entity";
import { Promocodes } from "./promocodes.entity";
import { Events } from "./events.entity";


@Entity()

export class Tickets{
    @PrimaryGeneratedColumn('uuid')
    id:IdValueObject;

    @Column({default:'Regular', enum:['Regular','VIP','VVIP']})
    type: string;

    @Column({default:'New', 
        enum:['New','active','Available','Pending Payment','Paid','Completed','Cancelled','Cancelled','Refunded','Hold']
     })
     status: string;

    /*
    Ticket Status List and thier description        
        - New
            A ticket has been created but not processed yet.
        - Available
            The ticket is ready for sale.

        - Pending Payment
            The order is created but awaiting payment.
        - Paid
            Payment has been completed for the ticket.

        - Completed
            The order has been delivered or collected successfully.

        - Cancelled
            The order has been voided or canceled.

        - Refunded
            The ticket was refunded, either partially or fully.

        - Hold
            The order is temporarily paused.

        - Failed
            The payment or processing of the ticket failed.

        - expired
         The ticket has expired. This status is applicable for tickets that have a sales_end date.s
    */

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;


    @Column({default:false})
    hasPromcode: boolean;

    @Column('text')
    qr_code:string;

    @Column({unique:true})
    ticket_no:string;

    @ManyToOne(()=>TicketsHeading,(ticket)=> ticket.tickets,{  onDelete: 'CASCADE', })
    @JoinColumn({ name: 'ticket_heading_id'})
    ticket_heading_id: IdValueObject;

    @ManyToOne(()=>Events,(event)=> event.tickets,{  onDelete: 'CASCADE', })
    @JoinColumn({ name: 'event_id'})
    event_id: IdValueObject;

    @ManyToOne(() => Promocodes, (promocode) => promocode.id)
    @JoinColumn({ name: 'promocode_id' })
    promocode_id: Promocodes;
}