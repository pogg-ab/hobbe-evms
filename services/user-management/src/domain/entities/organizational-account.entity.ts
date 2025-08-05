// src/domain/entities/organizational-account.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountStatus, Status } from '../value-objects/account-status.value-object';
import { KYCID } from '../value-objects/kyc-id.value-object';
import { OrganizationalAccountID } from '../value-objects/organizational-account-id.value-object';
import { OwnerID } from '../value-objects/owner-id.value-object';
import { KYC } from './kyc.entity';
import { Owner } from './owner.entity';

@Entity()
export class OrganizationalAccount {
  @PrimaryGeneratedColumn('uuid')
  organizational_account_id: OrganizationalAccountID;

  @Column()
  company_name: string;

  @Column()
  company_address: string;

  @Column()
  company_phone_number: string;

  @Column({ unique: true })
  company_email: string;

  @Column()
  company_type: string;

  @Column()
  TIN: string;

  @Column()
  operating_country: string;

  @OneToOne(() => KYC, { nullable: true })
  @JoinColumn({ name: 'kyc_id' })
  kyc: KYCID;

  @OneToOne(() => Owner, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: OwnerID;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status = Status.ACTIVE;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ nullable: true })
  verification_date?: Date;

  @Column({ default: false })
  is_email_verified: boolean;

  @Column({ nullable: true, select: false })
  email_verification_token?: string;

  @Column({ nullable: true })
  email_verification_expires?: Date;

  @Column({ default: false })
  is_phone_number_verified: boolean;

  @Column({ nullable: true, select: false })
  phone_verification_token?: string;

  @Column({ nullable: true })
  phone_verification_expires?: Date;

  @CreateDateColumn()
  created_date: Date;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @UpdateDateColumn()
  updated_date: Date;
}
