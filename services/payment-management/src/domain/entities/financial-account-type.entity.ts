import { Entity, Column, PrimaryColumn, ValueTransformer } from 'typeorm';
import { FinancialAccountTypeIdValueObject } from '../value-objects/financial-account-type-id.value-object';

const financialAccountTypeIdTransformer: ValueTransformer = {
  to: (value: FinancialAccountTypeIdValueObject) =>
    value ? value.toString() : null,
  from: (value: string) => new FinancialAccountTypeIdValueObject(value),
};
@Entity('financial_account_types')
export class FinancialAccountType {
  @PrimaryColumn({
    type: 'varchar',
    length: 70,
    transformer: financialAccountTypeIdTransformer,
  })
  financial_account_type_id: FinancialAccountTypeIdValueObject;

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
