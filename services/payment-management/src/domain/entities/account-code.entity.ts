import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { AccountCodeIdValueObject } from '../value-objects/account-code-id.value-object';

@Entity('account_codes')
export class AccountCode {
    @PrimaryGeneratedColumn('uuid')
    account_code_id: AccountCodeIdValueObject;

    @Column({ type: 'int' })
    code: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({ type: 'boolean' })
    is_normal_debit: boolean;

    @Column()
    created_by: string;

    @Column({ nullable: true })
    updated_by: string;

    @Column()
    created_at: Date;

    @Column({ nullable: true })
    updated_at: Date;
}