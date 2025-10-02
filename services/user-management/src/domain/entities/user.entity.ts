import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
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
import { OAuthProvider } from './oauth-provider.entity';
import { UserSecuritySetting } from './user-security-setting.entity';
import { UserSession } from './user-session.entity';
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: UserID;

  @Column({ unique: true })
  user_name: string;

  @Column({ nullable: true, unique: true })
  profile_id: string;

  @Column({ nullable: true })
  profile_name: string;

  @Column({ nullable: true })
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
    eager: true,
  })
  @JoinColumn({ name: 'personal_account_id' })
  personal_account: PersonalAccountID;

  @OneToOne(() => OrganizationalAccount, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'organizational_account_id' })
  organizational_account: OrganizationalAccountID;

  @Column({ type: 'boolean', default: true })
  is_primary_account: boolean;

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

  @OneToMany(() => OAuthProvider, (provider) => provider.user)
  providers: OAuthProvider[];

  @OneToOne(() => UserSecuritySetting, (settings) => settings.user, {
    cascade: true,
    eager: true,
  })
  securitySettings: UserSecuritySetting;

  @OneToMany(() => UserSession, (session) => session.user, { cascade: false })
  sessions: UserSession[];

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  ensureProfileDetails(): void {
    if (!this.profile_id || !this.profile_name) {
      this.updateProfileDetails();
    }
  }

  public updateProfileDetails(): void {
    if (!this.user_id) {
      throw new Error('User ID is required to generate profile details');
    }

    const userIdPrefix =
      this.user_id.toString().toLowerCase().substring(0, 3) +
      this.user_id.toString().toLowerCase().slice(-2);
    if (this.account_type === AccountType.PERSONAL && this.personal_account) {
      const personalAccount = this
        .personal_account as unknown as PersonalAccount;
      if (personalAccount.first_name && personalAccount.surname) {
        const cleanFirstName = this.sanitizeForId(personalAccount.first_name);
        const cleanSurname = this.sanitizeForId(personalAccount.surname);

        this.profile_id = `${cleanFirstName}_${cleanSurname}_${userIdPrefix}`;
        this.profile_name = `${personalAccount.first_name} ${personalAccount.surname}`;
      }
    } else if (
      this.account_type === AccountType.ORGANIZATIONAL &&
      this.organizational_account
    ) {
      const orgAccount = this
        .organizational_account as unknown as OrganizationalAccount;
      if (orgAccount.company_name) {
        const cleanCompanyName = this.sanitizeForId(orgAccount.company_name);

        this.profile_id = `${cleanCompanyName}_${userIdPrefix}`;
        this.profile_name = orgAccount.company_name;
      }
    }
  }

  private sanitizeForId(input: string): string {
    return input
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, '_')
      .replace(/[^\w-]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  public getDisplayName(): string {
    if (this.profile_name) {
      return this.profile_name;
    }

    if (this.account_type === AccountType.PERSONAL && this.personal_account) {
      const personalAccount = this
        .personal_account as unknown as PersonalAccount;
      return `${personalAccount.first_name || ''} ${personalAccount.surname || ''}`.trim();
    } else if (
      this.account_type === AccountType.ORGANIZATIONAL &&
      this.organizational_account
    ) {
      const orgAccount = this
        .organizational_account as unknown as OrganizationalAccount;
      return orgAccount.company_name || '';
    }

    return this.user_name;
  }
}
