import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IdValueObject } from "../value-objects/event-id.value-object";
import { Events } from "./events.entity";

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

    @Column({nullable: true})
    user_id: string;

    @ManyToOne(() => Events, (event) => event.bank_accounts,{  onDelete: 'CASCADE', })

    @JoinColumn({ name: 'event_id' })
    event_id: Events;
}