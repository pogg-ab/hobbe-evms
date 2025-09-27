
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Payments } from "./payments.entity";


@Entity()

export class Refund {
  
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column({nullable:true})
    refund_external_id:string;

    @Column()
    payment_id: string;

    @Column()
    event_id: string;

    @Column({nullable: true})
    reason: string;

}