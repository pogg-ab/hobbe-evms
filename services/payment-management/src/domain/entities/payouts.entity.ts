import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IdValueObject } from "../value-objects/event-id.value-object";

@Entity()
export class Payouts {
    @PrimaryGeneratedColumn('uuid')
    id: IdValueObject;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'uuid'})
    event_id: string;

    @Column()
    amount: number;

    @Column()
    currency: string;

    @Column()
    tx_ref: string;

    @Column()
    payment_method: string;

    @Column({ default: 'Pending' })
    payment_status: string;

    @Column({ nullable: true, default: 0 })
    charge: string;

    @Column({ nullable: true })
    bank_name?: string;

    @Column({ nullable: true })
    mobile_money_provider?: string;

    @Column({ nullable: true })
    account_number?: string;

    @Column({ type: 'timestamptz', default: new Date() })
    created_at: Date;

    @Column({ type: 'timestamptz', nullable: true })
    verified_at: Date;

    @Column({ nullable: true })
    narration?: string;
}