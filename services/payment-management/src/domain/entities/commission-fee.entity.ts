import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { CommissionFeeIdValueObject } from '../value-objects/commission-fee-id.value-object';

@Entity('commission_fees')
export class CommissionFee {
    @PrimaryGeneratedColumn('uuid')
    commission_fee_id: CommissionFeeIdValueObject;

    @Column()
    organizer_id: string;

    @Column()
    applies_to_event_type: string;

    @Column({ type: 'float' })
    rate: number;

    @Column()
    effective_date: Date;

    @Column()
    created_by: string;

    @Column({ nullable: true })
    updated_by: string;

    @Column()
    created_at: Date;

    @Column({ nullable: true })
    updated_at: Date;
}