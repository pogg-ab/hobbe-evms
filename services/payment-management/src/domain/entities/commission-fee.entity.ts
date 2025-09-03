import { Entity, Column, PrimaryColumn } from 'typeorm';
import { CommissionFeeIdValueObject } from '../value-objects/commission-fee-id.value-object';

@Entity('commission_fees')
export class CommissionFee {
  @PrimaryColumn({
    type: 'uuid',
    transformer: {
      to(value: CommissionFeeIdValueObject): string {
        return value.toString();
      },
      from(value: string): CommissionFeeIdValueObject {
        return new CommissionFeeIdValueObject(value);
      },
    },
  })
  commission_fee_id: CommissionFeeIdValueObject;

  @Column()
  organizer_id: string;

  @Column()
  applies_to_event_type: string;

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
