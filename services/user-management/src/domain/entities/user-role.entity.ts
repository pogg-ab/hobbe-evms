import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoleID } from '../value-objects/role-id.value-object';
import { UserID } from '../value-objects/user-id.value-object';
import { UserRoleID } from '../value-objects/user-role-id.value-object';
import { Role } from './role.entity';
import { User } from './user.entity';

@Entity()
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  user_role_id: UserRoleID;

  @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE' })
  user: UserID;

  @ManyToOne(() => Role, { cascade: true, onDelete: 'CASCADE' })
  role: RoleID;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
