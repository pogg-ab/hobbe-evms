import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FinancialAccountIdValueObject } from '../value-objects/financial-account-id.value-object';
import { AccountCode } from '../entities/account-code.entity';
import { BankAccounts } from './bank_accounts.entity';
import { FinancialAccountType } from '../entities/financial-account-type.entity';
import { Currency } from './currency.entity';

@Entity('financial_accounts')
export class FinancialAccount {
    @PrimaryGeneratedColumn('uuid')
    financial_account_id: FinancialAccountIdValueObject;

    @ManyToOne(() => AccountCode)
    @JoinColumn({ name: 'account_code_id' })
    account_code: AccountCode;

    @ManyToOne(() => BankAccounts, { nullable: true })
    @JoinColumn({ name: 'bank_account_id' })
    bank_account: BankAccounts;

    @ManyToOne(() => FinancialAccountType)
    @JoinColumn({ name: 'financial_account_type_id' })
    financial_account_type: FinancialAccountType;

    @ManyToOne(() => Currency)
    @JoinColumn({ name: 'currency_id' })
    currency: string;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    total_balance: number;

    @ManyToOne(() => FinancialAccount, { nullable: true })
    @JoinColumn({ name: 'holding_financial_account_id' })
    holding_financial_account: FinancialAccount;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'uuid', nullable: true })
    event_id: string;

    @Column()
    created_by: string;

    @Column({ nullable: true })
    updated_by: string;

    @Column()
    created_date: Date;

    @Column({ nullable: true })
    updated_date: Date;
}