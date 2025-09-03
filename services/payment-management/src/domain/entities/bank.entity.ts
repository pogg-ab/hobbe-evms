import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BankIdValueObject } from '../value-objects/bank-id.value-object';

@Entity('banks')
export class Bank {
    @PrimaryGeneratedColumn('uuid')
    bank_id: BankIdValueObject;

    @Column()
    bank_name: string;

    @Column()
    created_by: string;

    @Column({ nullable: true })
    updated_by: string;

    @Column()
    created_at: Date;

    @Column({ nullable: true })
    updated_at: Date;
}