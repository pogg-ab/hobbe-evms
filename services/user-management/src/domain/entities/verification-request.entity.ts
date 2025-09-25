// src/domain/entities/verification-request.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { PersonalAccount } from './personal-account.entity';
import { AdminUser } from './admin-user.entity';
import { OrganizationalAccount } from './organizational-account.entity';

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
}

@Entity({ name: 'verification_request' })
export class VerificationRequest {
  @PrimaryGeneratedColumn('uuid', { name: 'verification_request_id' })
  verification_request_id: string;

  @ManyToOne(() => PersonalAccount, (pa) => pa.verification_request, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'personal_account_id' })
  personal_account: PersonalAccount;

  @ManyToOne(() => OrganizationalAccount, (oa) => oa.verification_request, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'organizational_account_id' })
  organizational_account?: OrganizationalAccount | null;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'text', name: 'national_id_image' })
  national_id_image: string;

  @Column({ type: 'text', name: 'rejection_reason', nullable: true })
  rejection_reason?: string | null;

  @CreateDateColumn({ name: 'submitted_at', type: 'timestamp with time zone' })
  submitted_at: Date;

  @Column({
    type: 'timestamp with time zone',
    name: 'reviewed_at',
    nullable: true,
  })
  reviewed_at?: Date | null;

  /**
   * Admin who reviewed. FK stored in `reviewed_by` column referencing admin_user_account(admin_user_account_id).
   */
  @OneToOne(() => AdminUser, { nullable: true, eager: false })
  @JoinColumn({ name: 'reviewed_by' })
  reviewed_by?: AdminUser | null;
  length: number;
}
