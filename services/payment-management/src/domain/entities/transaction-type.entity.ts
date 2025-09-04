import { Entity, Column, PrimaryColumn, ValueTransformer } from 'typeorm';
import { TransactionTypeIdValueObject } from '../value-objects/transaction-type-id.value-object';

const transactionTypeIdTransformer: ValueTransformer = {
    to: (value: TransactionTypeIdValueObject) =>
        value ? value.toString() : null,
    from: (value: string) => new TransactionTypeIdValueObject(value),
};
@Entity('transaction_types')
export class TransactionType {
    @PrimaryColumn({
        type: 'varchar',
        length: 50,
        transformer: transactionTypeIdTransformer,
    })
    transaction_type_id: TransactionTypeIdValueObject;

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