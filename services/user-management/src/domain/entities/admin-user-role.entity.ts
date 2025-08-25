import {
  Column, // <-- Make sure Column is imported
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdminUserID } from '../value-objects/admin-user-id.value-object';
import { AdminUserRoleID } from '../value-objects/admin-user-role-id.value-object';
import { AdminUser } from './admin-user.entity';
import { Role } from './role.entity';

// Define the possible roles within a group (as per the Jira ticket)
export enum GroupMembershipRole {
  MEMBER = 'MEMBER',
  GROUP_ADMIN = 'GROUP_ADMIN',
}

@Entity()
export class AdminUserRole {
  @PrimaryGeneratedColumn('uuid')
  admin_user_role_id: AdminUserRoleID;

  @ManyToOne(() => AdminUser, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_user_id' })
  admin_user_id: AdminUserID;

  @ManyToOne(() => Role, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  // --- THIS IS THE NEW PROPERTY YOU ARE ADDING ---
  @Column({
    type: 'enum',
    enum: GroupMembershipRole,
    default: GroupMembershipRole.MEMBER, // By default, new users are just members
  })
  membershipRole: GroupMembershipRole;
  // --- END OF NEW PROPERTY ---

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}