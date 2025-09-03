import { Entity, Column, PrimaryColumn } from 'typeorm';
import { TaxIdValueObject } from '../value-objects/tax-id.value-object';

@Entity('taxes')
export class Tax {
  @PrimaryColumn({
    type: 'uuid',
    transformer: {
      to(value: TaxIdValueObject): string {
        return value.toString();
      },
      from(value: string): TaxIdValueObject {
        return new TaxIdValueObject(value);
      },
    },
  })
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
