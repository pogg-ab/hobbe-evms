import { Column, Entity, IsNull, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IdValueObject } from "../value-objects/event-id.value-object";
import { Events } from "./events.entity";


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
    sales_start: Date;
    
    @Column()
    sales_end: Date;
    
    @Column({default:'pending', enum: ['pending', 'active', 'cancelled','Expired'] })
    status: string;


    @Column({nullable: true })
    created_by: string;

    @Column({nullable: true  })
    update_by: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: true })
    updated_at: Date;

    @OneToOne(() => Events, (event) => event.id, {
        cascade: true, // Ensures related BankAccounts are automatically saved
        onDelete: 'CASCADE', 
      })
    @JoinColumn({ name: 'event_id' })
    event_id: string;
}