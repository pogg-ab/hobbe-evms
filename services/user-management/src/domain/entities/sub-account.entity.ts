import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubAccountID } from '../value-objects/sub-account-id.value-object';
import { SubAccountStatus } from '../value-objects/sub-account-status.value-object';
import { OrganizationalAccount } from './organizational-account.entity';
import { PersonalAccount } from './personal-account.entity';
import { User } from './user.entity';
import { UserID } from '../value-objects/user-id.value-object';
import { SubAccountStatusTransformer } from '../transformer/sub-account-status.transformer';

export enum Privileges {
  ADD_SUB_ACCOUNTS = 'add_sub_accounts',
  MANAGE_GUESTS = 'manage_guests',
  MANAGE_SUB_ACCOUNTS = 'manage_sub_accounts',
  CREATE_EVENTS = 'create_events',
}


@Entity()
export class SubAccount {
  @PrimaryGeneratedColumn('uuid')
  sub_account_id: SubAccountID;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'owner_user_id', referencedColumnName: 'user_id' })
  owner_user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'sub_account_user_id', referencedColumnName: 'user_id' })
  sub_account_user: User;

  @Column()
  generated_user_id: string;

  @Column({ type: 'date' })
  expire_date: Date;

  @Column({
    type: 'enum',
    enum: Privileges,
    array: true,
    nullable: true,
    default: null
  })
  privileges: Privileges[] | null;

  @Column({
    type: 'varchar',
    transformer: new SubAccountStatusTransformer(),
  })
  status: SubAccountStatus;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @UpdateDateColumn()
  updated_at: Date;

}
