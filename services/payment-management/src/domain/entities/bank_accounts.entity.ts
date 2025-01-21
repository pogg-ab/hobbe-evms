import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IdValueObject } from "../value-objects/event-id.value-object";

@Entity()
export class BankAccounts{
    @PrimaryGeneratedColumn('uuid')
    id: IdValueObject;

    @Column()
    bank_name: string;

    @Column()
    account_owner: string;
    
    @Column()
    account_number: string;

    @Column()
    country: string;

    @Column()
    currency: string;

    @Column({nullable: true})
    user_id: string;

   
    @Column({ name: 'event_id' })
    event_id: string;
}