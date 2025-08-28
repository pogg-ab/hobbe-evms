import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdminUser } from './admin-user.entity';

@Entity({ name: 'admin_user_security_settings' })
export class AdminUserSecuritySetting {
  @PrimaryColumn({ type: 'uuid' })
  admin_user_id: string;

  @OneToOne(() => AdminUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_user_id' })
  adminUser: AdminUser;

  @Column({ default: false })
  mfa_enabled: boolean;

  @Column({ type: 'text', nullable: true })
  mfa_secret: string | null;

  @Column({ type: 'text', nullable: true })
  mfa_temp_secret: string | null;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  last_mfa_verified_at: Date | null;
}