import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { TransactionTypeIdValueObject } from '../value-objects/transaction-type-id.value-object';

@Entity('transaction_types')
export class TransactionType {
    @PrimaryGeneratedColumn('uuid')
    transaction_type_id: TransactionTypeIdValueObject;

    @Column()
    transaction_type_name: string;

    @Column()
    description: string;

    @Column()
    created_by: string;

    @Column({ nullable: true })
    updated_by: string;

    @Column()
    created_at: Date;

    @Column({ nullable: true })
    updated_at: Date;
}