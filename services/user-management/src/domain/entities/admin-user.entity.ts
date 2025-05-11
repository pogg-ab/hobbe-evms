import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdminUserAccountID } from '../value-objects/admin-user-account-id.value-object';
import { AdminUserID } from '../value-objects/admin-user-id.value-object';
import { AdminUserAccount } from './admin-user-account.entity';

@Entity()
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  admin_user_id: AdminUserID;

  @Column({ unique: true })
  user_name: string;

  @Column()
  password: string;

  @OneToOne(() => AdminUserAccount, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'admin_user_account_id' })
  admin_user_account: AdminUserAccountID;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  updated_by: string;

  @UpdateDateColumn()
  updated_at: Date;
}
