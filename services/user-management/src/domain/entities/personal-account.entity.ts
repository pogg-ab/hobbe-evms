// src/domain/entities/personal-account.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountStatus } from '../value-objects/account-status.value-object';
import { PersonalAccountID } from '../value-objects/personal-account-id.value-object';

@Entity()
export class PersonalAccount {
  @PrimaryGeneratedColumn('uuid')
  personal_account_id: PersonalAccountID;

  @Column()
  first_name: string;

  @Column()
  surname: string;

  @Column({ unique: true })
  email_address: string;

  @Column()
  phone_number: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  profile_image: string;

  @Column()
  date_of_birth: string;

  @Column()
  national_id: string;

  @Column({ nullable: true })
  national_id_image: string;

  @Column()
  gender: string;

  @Column(() => AccountStatus)
  status: AccountStatus;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ nullable: true })
  verification_date?: Date;

  @Column({ default: false })
  is_email_verified: boolean;

  @Column({ nullable: true })
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
  updated_by: string;

  @UpdateDateColumn()
  updated_date: Date;
}
