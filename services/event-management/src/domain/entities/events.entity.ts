import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IdValueObject } from "../value-objects/event-id.value-object";
import { BankAccounts } from "./bank_accounts.entity";

@Entity()
export class Events {

    @PrimaryGeneratedColumn('uuid')
    id: IdValueObject;

    @Column()
    title: string;

    @Column()
    description: string;
    
    @Column()
    location: string;

    @Column({ enum: ['public', 'private', 'group'] })
    privacy: string;

    @Column({default:'drafted', enum: ['drafted', 'pending', 'cancelled','rejected','postponed','active'] })
    status: string;

    @Column()
    event_start_date: Date;

    @Column()
    event_end_date: Date;

    @Column({nullable:true})
    catagory: string;

    @Column({nullable: true })
    created_by: string;

    @Column({nullable: true  })
    update_by: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: true })
    updated_att: Date;

    @OneToMany(() => BankAccounts, (bankAccount) => bankAccount.event_id, {
        cascade: true, // Ensures related BankAccounts are automatically saved
        onDelete: 'CASCADE', 
      })
      bank_accounts: BankAccounts[];
}
