import {
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

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
