// src/domain/entities/user.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountType } from '../value-objects/account-type.value-object';
import { OrganizationalAccountID } from '../value-objects/organizational-account-id.value-object';
import { PersonalAccountID } from '../value-objects/personal-account-id.value-object';
import { UserID } from '../value-objects/user-id.value-object';
import { OrganizationalAccount } from './organizational-account.entity';
import { PersonalAccount } from './personal-account.entity';
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: UserID;

  @Column({ unique: true })
  user_name: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    default: AccountType.PERSONAL,
  })
  account_type: AccountType;

  @OneToOne(() => PersonalAccount, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'personal_account_id' })
  personal_account: PersonalAccountID;

  @OneToOne(() => OrganizationalAccount, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'organizational_account_id' })
  organizational_account: OrganizationalAccountID;

  @Column({
    type: 'varchar',
    length: 6,
    nullable: true,
  })
  otp: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  otp_expiry: Date;

  @Column({ default: true })
  is_active: boolean;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  password_reset_token: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  password_reset_token_expiry: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  password_reset_requested_at: Date;

  @CreateDateColumn()
  created_date: Date;

  @Column({ nullable: true })
  updated_by: string;

  @UpdateDateColumn()
  updated_date: Date;
}
