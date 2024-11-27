import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubAccountID } from '../value-objects/sub-account-id.value-object';
import { SubAccountStatus } from '../value-objects/sub-account-status.value-object';
import { OrganizationalAccount } from './organizational-account.entity';
import { PersonalAccount } from './personal-account.entity';

@Entity()
export class SubAccount {
  @PrimaryGeneratedColumn('uuid')
  sub_account_id: SubAccountID;

  @OneToMany(
    () => OrganizationalAccount,
    (account) => account.organizational_account_id,
    { nullable: true },
  )
  @JoinColumn({ name: 'main_account_id' })
  organizational_account_main: OrganizationalAccount;

  @OneToMany(() => PersonalAccount, (account) => account.personal_account_id, {
    nullable: true,
  })
  @JoinColumn({ name: 'main_account_id' })
  personal_account_main: PersonalAccount;

  @OneToMany(
    () => OrganizationalAccount,
    (account) => account.organizational_account_id,
    { nullable: true },
  )
  @JoinColumn({ name: 'owner_account_id' })
  organizational_account_owner: OrganizationalAccount;

  @OneToMany(() => PersonalAccount, (account) => account.personal_account_id, {
    nullable: true,
  })
  @JoinColumn({ name: 'owner_account_id' })
  personal_account_owner: PersonalAccount;

  @Column()
  generated_user_id: string;

  @Column({ type: 'date' })
  expire_date: Date;

  @Column(() => SubAccountStatus)
  status: SubAccountStatus;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @UpdateDateColumn()
  updated_at: Date;

  constructor() {
    this.sub_account_id = new SubAccountID();
    this.status = new SubAccountStatus('active');
  }
}
