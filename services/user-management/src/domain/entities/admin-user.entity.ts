import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdminUserAccountID } from '../value-objects/admin-user-account-id.value-object';
import { AdminUserID } from '../value-objects/admin-user-id.value-object';
import { AdminUserAccount } from './admin-user-account.entity';
import { AdminUserSecuritySetting } from './admin-user-security-setting.entity';
import { AdminUserSession } from './admin-user-session.entity';

@Entity()
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  admin_user_id: AdminUserID;

  @Column({ unique: true })
  user_name: string;

  @Column({ nullable: true })
  password: string;

  @OneToOne(() => AdminUserAccount, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'admin_user_account_id' })
  admin_user_account: AdminUserAccountID;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ssoProvider: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ssoProviderId: string | null;

  @OneToOne(() => AdminUserSecuritySetting, (settings) => settings.adminUser, {
    cascade: true,
    eager: true,
  })
  securitySettings: AdminUserSecuritySetting;

  @OneToMany(() => AdminUserSession, (session) => session.adminUser)
  sessions: AdminUserSession[];

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
