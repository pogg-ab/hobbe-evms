import { Entity, Column, PrimaryColumn } from 'typeorm';
import { PaymentGatewayFeeIdValueObject } from '../value-objects/payment-gateway-fee-id.value-object';

@Entity('payment_gateway_fees')
export class PaymentGatewayFee {
  @PrimaryColumn({
    type: 'uuid',
    transformer: {
      to(value: PaymentGatewayFeeIdValueObject): string {
        return value.toString();
      },
      from(value: string): PaymentGatewayFeeIdValueObject {
        return new PaymentGatewayFeeIdValueObject(value);
      },
    },
  })
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
