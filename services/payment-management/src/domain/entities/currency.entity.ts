import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { CurrencyIdValueObject } from '../value-objects/currency-id.value-object';

@Entity('currencies')
export class Currency {
    @PrimaryGeneratedColumn('uuid')
    currency_id: CurrencyIdValueObject;

    @Column()
    currency_name: string;

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