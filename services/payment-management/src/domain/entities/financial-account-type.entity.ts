import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { FinancialAccountTypeIdValueObject } from '../value-objects/financial-account-type-id.value-object';

@Entity('financial_account_types')
export class FinancialAccountType {
    @PrimaryGeneratedColumn('uuid')
    financial_account_type_id: FinancialAccountTypeIdValueObject;

    @Column({ length: 70 })
    financial_account_name: string;

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