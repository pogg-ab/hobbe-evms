import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AccountChangeIdValueObject } from '../value-objects/account-change-id.value-object';
import { FinancialAccount } from '../entities/financial-account.entity';
import { Transaction } from '../entities/transaction.entity';
import { TransactionItem } from '../entities/transaction-item.entity';

@Entity('account_changes')
export class AccountChange {
    @PrimaryGeneratedColumn('uuid')
    account_change_id: AccountChangeIdValueObject;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    balance: number;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    delta: number;

    @ManyToOne(() => FinancialAccount)
    @JoinColumn({ name: 'financial_account_id' })
    financial_account: FinancialAccount;

    @ManyToOne(() => Transaction)
    @JoinColumn({ name: 'transaction_id' })
    transaction: Transaction;

    @ManyToOne(() => TransactionItem, { nullable: true })
    @JoinColumn({ name: 'transaction_item_id' })
    transaction_item: TransactionItem;

    @Column()
    created_by: string;

    @Column({ nullable: true })
    updated_by: string;

    @Column({ nullable: true })
    created_date: Date;

    @Column({ nullable: true })
    updated_date: Date;
}