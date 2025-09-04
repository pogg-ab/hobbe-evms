import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { TransactionType } from 'src/domain/entities/transaction-type.entity';
import { TransactionTypeIdValueObject } from 'src/domain/value-objects/transaction-type-id.value-object';

export default class TransactionTypeSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager,
    ): Promise<void> {
        const repository = dataSource.getRepository(TransactionType);

        const transactionTypes = [
            {
                transaction_type_id: 'CUSTOMER_TICKET_PURCHASE',
                description: 'Customer purchases an event ticket',
                created_by: 'fixture',
                updated_by: 'fixture',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                transaction_type_id: 'CUSTOMER_TICKET_PURCHASE_REFUND',
                description: 'Customer refunded for purchased ticket',
                created_by: 'fixture',
                updated_by: 'fixture',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                transaction_type_id: 'CUSTOMER_TICKET_MANUAL_REFUND',
                description: 'Customer refunded an event ticket manually',
                created_by: 'fixture',
                updated_by: 'fixture',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                transaction_type_id: 'ORGANIZER_PAYOUT',
                description: 'Organizer payout for an event ticket sales',
                created_by: 'fixture',
                updated_by: 'fixture',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                transaction_type_id: 'TAX_PAYOUT',
                description: 'Tax payout for government entity',
                created_by: 'fixture',
                updated_by: 'fixture',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        for (const txTypeData of transactionTypes) {
            const txType = new TransactionType();
            txType.transaction_type_id = new TransactionTypeIdValueObject(
                txTypeData.transaction_type_id,
            );
            txType.description = txTypeData.description;
            txType.created_by = txTypeData.created_by;
            txType.updated_by = txTypeData.updated_by;
            txType.created_at = txTypeData.created_at;
            txType.updated_at = txTypeData.updated_at;

            await repository.save(txType);
        }
    }
}
