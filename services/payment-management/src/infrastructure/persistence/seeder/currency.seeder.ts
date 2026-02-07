import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Currency } from 'src/domain/entities/currency.entity';
import { CurrencyIdValueObject } from 'src/domain/value-objects/currency-id.value-object';

export default class CurrencySeeder implements Seeder {
    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
        const repository = dataSource.getRepository(Currency);

        const currencies = [
            {
                currency_id: new CurrencyIdValueObject('ETB'),
                description: 'Ethiopian Birr',
                created_by: 'fixture',
                updated_by: 'fixture',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                currency_id: new CurrencyIdValueObject('USD'),
                description: 'United States Dollar',
                created_by: 'fixture',
                updated_by: 'fixture',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        for (const currencyData of currencies) {
            const currency = new Currency();
            currency.currency_id = currencyData.currency_id;
            currency.description = currencyData.description;
            currency.created_by = currencyData.created_by;
            currency.updated_by = currencyData.updated_by;
            currency.created_at = currencyData.created_at;
            currency.updated_at = currencyData.updated_at;

            await repository.save(currency);
        }
    }
}