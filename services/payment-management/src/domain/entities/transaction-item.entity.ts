import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TransactionItemIdValueObject } from '../value-objects/transaction-item-id.value-object';
import { AccountCode } from '../entities/account-code.entity';
import { FinancialAccount } from './financial-account.entity';
import { Transaction } from '../entities/transaction.entity';

@Entity('transaction_items')
export class TransactionItem {
    @PrimaryGeneratedColumn('uuid')
    transaction_item_id: TransactionItemIdValueObject;

    @ManyToOne(() => AccountCode)
    @JoinColumn({ name: 'account_code_id' })
    account_code: AccountCode;

    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
    credit_amount: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
    debit_amount: number;

    @Column({ nullable: true })
    description: string;

    @ManyToOne(() => FinancialAccount)
    @JoinColumn({ name: 'financial_account_id' })
    financial_account: FinancialAccount;

    @ManyToOne(() => Transaction)
    @JoinColumn({ name: 'transaction_id' })
    transaction: Transaction;

    @Column({ type: 'int' })
    transaction_line_number: number;

    @Column({ nullable: true })
    created_by: string;

    @Column({ nullable: true })
    updated_by: string;

    @Column({ nullable: true })
    created_date: Date;

    @Column({ nullable: true })
    updated_date: Date;
}