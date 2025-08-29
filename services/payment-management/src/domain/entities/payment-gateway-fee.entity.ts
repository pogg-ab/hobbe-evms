import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentGatewayFeeIdValueObject } from '../value-objects/payment-gateway-fee-id.value-object';

@Entity('payment_gateway_fees')
export class PaymentGatewayFee {
    @PrimaryGeneratedColumn('uuid')
    payment_gateway_fee_id: PaymentGatewayFeeIdValueObject;

    @Column()
    provider_name: string;

    @Column({ type: 'float' })
    percentage_rate: number;

    @Column({ type: 'float' })
    fixed_fee: number;

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