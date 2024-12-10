import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IdValueObject } from "../value-objects/event-id.value-object";
import { Tickets } from "./tickets.entity";


@Entity()

export class TicketsList{
    @PrimaryGeneratedColumn('uuid')
    id:IdValueObject;

    @Column({default:'Regular', enum:['Regular','VIP','VVIP']})
    type: string;

    @Column({default:'New', 
        enum:['New','Available','Pending Payment','Paid','Completed','Cancelled','Cancelled','Refunded','Hold']
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


    @Column({nullable:true})
    promo_code: string;

    @Column({type: 'decimal', nullable:true})
    discount: number;

    @Column('text')
    qr_code:string;

    @Column({unique:true})
    ticket_no:string;

    @ManyToOne(()=>Tickets,(ticket)=> ticket.id)
    @JoinColumn({ name: 'ticket_id'})
    ticket_id: IdValueObject;
}