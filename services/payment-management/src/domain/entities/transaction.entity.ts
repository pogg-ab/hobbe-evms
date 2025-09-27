import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TransactionIdValueObject } from '../value-objects/transaction-id.value-object';
import { Payments } from './payments.entity';
import { TransactionType } from '../entities/transaction-type.entity';
import { Currency } from '../entities/currency.entity';

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    transaction_id: TransactionIdValueObject;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    amount: number;

    @ManyToOne(() => Payments, { nullable: true })
    @JoinColumn({ name: 'payment_id' })
    payment: Payments;

    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
    fee: number;

    @ManyToOne(() => TransactionType)
    @JoinColumn({ name: 'transaction_type_id' })
    transaction_type: TransactionType;

    @Column({ nullable: true })
    reference_number: string;

    @Column({ nullable: true })
    short_code: string;

    @Column()
    transaction_date: Date;

    @Column({ nullable: true })
    external_reference_number: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @ManyToOne(() => Currency)
    @JoinColumn({ name: 'currency_id' })
    currency: Currency;

    @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
    exchange_rate: number;

    @Column({nullable: true })
    __reverses: string;

    @Column({ nullable: true })
    __reversed_by: string;

    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
    foreign_currency_amount: number;

    @Column()
    created_by: string;

    @Column({ nullable: true })
    updated_by: string;

    @Column({default:new Date()})
    created_date: Date;

    @Column({ nullable: true })
    updated_date: Date;

    // @Column({ type: 'int', nullable: true })
    // reverses: number;

     @Column({ nullable: true })
    reverses: string;



    @Column({ nullable: true })
    reversed_by: string;
}