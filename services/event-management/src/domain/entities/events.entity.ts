import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IdValueObject } from "../value-objects/event-id.value-object";
import { BankAccounts } from "./bank_accounts.entity";
import { TicketsHeading } from "./tickets-heading.entity";

@Entity()
export class Events {

    @PrimaryGeneratedColumn('uuid')
    id: IdValueObject;

    @Column()
    user_id: string;

    @Column()
    title: string;

    @Column({type:'text'})
    description: string;
    
    @Column()
    location: string;

    @Column()
    latitude: string;

    @Column()
    longitude: string;


    @Column({ enum: ['public', 'private', 'group'] })
    privacy: string;

    @Column({default:'drafted', enum: ['drafted', 'pending', 'cancelled','rejected','postponed','active'] })
    status: string;

    @Column()
    event_start_date: Date;

    @Column()
    event_end_date: Date;

    @Column({nullable:true})
    category: string;

    @Column({nullable: true })
    created_by: string;

    @Column({nullable: true  })
    update_by: string;

    @Column({ type: 'timestamp' ,nullable: true})
    created_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    updated_at: Date;

    @OneToOne(() => TicketsHeading, (ticket) => ticket.event_id, { cascade: true, nullable: true })
     @JoinColumn({ name: 'event_id' })
    ticket?: TicketsHeading;

    @OneToMany(() => BankAccounts, (bankAccount) => bankAccount.event_id, {
        cascade: true, // Ensures related BankAccounts are automatically saved
        onDelete: 'CASCADE', 
      })
    @JoinColumn({ name: 'event_id' })
    bank_accounts?: BankAccounts[];
}
