import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { AccountCode } from 'src/domain/entities/account-code.entity';

export default class AccountCodeSeeder implements Seeder {
    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
        const repository = dataSource.getRepository(AccountCode);

        const accountCodes = [
            {
                code: 1010,
                created_by: 'fixture',
                description: 'Hobbe pool account',
                is_normal_debit: true,
                name: 'Cash at bank',
                updated_by: 'fixture',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                code: 4010,
                created_by: 'fixture',
                description: 'Hobbe revenue account',
                is_normal_debit: false,
                name: 'Ticket Sales Revenue',
                updated_by: 'fixture',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                code: 2040,
                created_by: 'fixture',
                description: 'Tax payable account',
                is_normal_debit: false,
                name: 'Tax Collected',
                updated_by: 'fixture',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                code: 2030,
                created_by: 'fixture',
                description: 'Organizer\'s payout payable account',
                is_normal_debit: false,
                name: 'Organizer\'s Payouts Payable',
                updated_by: 'fixture',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                code: 5030,
                created_by: 'fixture',
                description: 'Payment gateway fees account',
                is_normal_debit: false,
                name: 'Payment Gateway Fees',
                updated_by: 'fixture',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                code: 1020,
                created_by: 'fixture',
                description: 'Payment gateway clearing account',
                is_normal_debit: true,
                name: 'Payment Gateway Clearing',
                updated_by: 'fixture',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        for (const accountCodeData of accountCodes) {
            const accountCode = new AccountCode();
            accountCode.code = accountCodeData.code;
            accountCode.created_by = accountCodeData.created_by;
            accountCode.description = accountCodeData.description;
            accountCode.is_normal_debit = accountCodeData.is_normal_debit;
            accountCode.name = accountCodeData.name;
            accountCode.updated_by = accountCodeData.updated_by;
            accountCode.created_at = accountCodeData.created_at;
            accountCode.updated_at = accountCodeData.updated_at;

            await repository.save(accountCode);
        }
    }
}