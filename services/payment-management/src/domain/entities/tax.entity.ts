import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { TaxIdValueObject } from '../value-objects/tax-id.value-object';

@Entity('taxes')
export class Tax {
    @PrimaryGeneratedColumn('uuid')
    tax_id: TaxIdValueObject;

    @Column({ type: 'float' })
    rate: number;

    @Column()
    effective_date: Date;

    @Column()
    created_by: string;

    @Column({ nullable: true })
    updated_by: string;

    @Column()
    created_at: Date;

    @Column({ nullable: true })
    updated_at: Date;
}