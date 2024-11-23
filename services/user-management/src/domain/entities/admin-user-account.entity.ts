import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountStatus } from '../value-objects/account-status.value-object';
import { AdminUserAccountID } from '../value-objects/admin-user-account-id.value-object';
import { AdminUserAccountStatus } from '../value-objects/admin-user-account-status.value-object';

@Entity()
export class AdminUserAccount {
  @PrimaryGeneratedColumn('uuid')
  admin_user_account_id: AdminUserAccountID;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email_address: string;

  @Column()
  phone_number: string;

  @Column({ nullable: true })
  profile_image: string;

  @CreateDateColumn()
  created_date: Date;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @UpdateDateColumn()
  updated_date: Date;

  @Column(() => AccountStatus)
  status: AdminUserAccountStatus;
}
