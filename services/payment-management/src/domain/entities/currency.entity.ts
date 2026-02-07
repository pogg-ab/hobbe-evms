import { Entity, Column, PrimaryGeneratedColumn, ValueTransformer, PrimaryColumn } from 'typeorm';
import { CurrencyIdValueObject } from '../value-objects/currency-id.value-object';

const currencyIdTransformer: ValueTransformer = {
    to: (value: CurrencyIdValueObject) =>
        value ? value.toString() : null,
    from: (value: string) => new CurrencyIdValueObject(value),
};

@Entity('currencies')
export class Currency {
    @PrimaryColumn({
        type: 'varchar',
        length: 50,
        transformer: currencyIdTransformer,
    })
    currency_id: CurrencyIdValueObject;


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