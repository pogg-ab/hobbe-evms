import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { FinancialAccountType } from 'src/domain/entities/financial-account-type.entity';
import { FinancialAccountTypeIdValueObject } from 'src/domain/value-objects/financial-account-type-id.value-object';

export default class FinancialAccountTypeSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(FinancialAccountType);

    const financialAccountTypes = [
      {
        financial_account_type_id: 'HOBBE_POOL_ACCOUNT',
        description: 'Hobbe cash pool account',
        created_by: 'fixture',
        updated_by: 'fixture',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        financial_account_type_id: 'ORGANIZER_VIRTUAL_ACCOUNT',
        description: "Organizer's virtual account",
        created_by: 'fixture',
        updated_by: 'fixture',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        financial_account_type_id: 'TAX_PAYABLE_ACCOUNT',
        description: 'Tax payable account',
        created_by: 'fixture',
        updated_by: 'fixture',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        financial_account_type_id: 'HOBBE_REVENUE_ACCOUNT',
        description: 'Hobbe revenue account',
        created_by: 'fixture',
        updated_by: 'fixture',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        financial_account_type_id: 'PAYMENT_GATEWAY_FEE_ACCOUNT',
        description: 'Payment gateway fee account',
        created_by: 'fixture',
        updated_by: 'fixture',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        financial_account_type_id: 'PAYMENT_GATEWAY_EXPENSE_ACCOUNT',
        description: 'Payment gateway expense account',
        created_by: 'fixture',
        updated_by: 'fixture',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    for (const accountTypeData of financialAccountTypes) {
      const accountType = new FinancialAccountType();
      accountType.financial_account_type_id =
        new FinancialAccountTypeIdValueObject(
          accountTypeData.financial_account_type_id,
        );
      accountType.description = accountTypeData.description;
      accountType.created_by = accountTypeData.created_by;
      accountType.updated_by = accountTypeData.updated_by;
      accountType.created_at = accountTypeData.created_at;
      accountType.updated_at = accountTypeData.updated_at;

      await repository.save(accountType);
    }
  }
}
