import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_security_settings' })
export class UserSecuritySetting {
  @PrimaryColumn({ type: 'uuid' })
  user_id: string;

  @OneToOne(() => User, (user) => user.securitySettings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: false })
  mfa_enabled: boolean;

  @Column({ type: 'text', nullable: true })
  mfa_secret: string | null;

  @Column({ type: 'text', nullable: true })
  mfa_temp_secret: string | null;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  last_mfa_verified_at: Date | null;
}
