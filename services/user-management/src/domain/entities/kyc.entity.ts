import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { KYCID } from '../value-objects/kyc-id.value-object';

@Entity()
export class KYC {
  @PrimaryGeneratedColumn('uuid')
  kyc_id: KYCID;

  @Column()
  company_logo: string;

  @Column()
  business_license: string;

  @Column()
  business_certificate: string;

  @Column()
  memorandum_of_association: string;

  @Column()
  proof_of_address: string;

  @Column()
  TIN: string;

  @Column({ nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
