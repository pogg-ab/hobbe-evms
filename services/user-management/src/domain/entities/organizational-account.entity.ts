// src/domain/entities/organizational-account.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountStatus } from '../value-objects/account-status.value-object';
import { OrganizationalAccountID } from '../value-objects/organizational-account-id.value-object';

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

  @Column({ nullable: true })
  company_website: string;

  @Column()
  company_type: string;

  @Column(() => AccountStatus)
  status: AccountStatus;

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
