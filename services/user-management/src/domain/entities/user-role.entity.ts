import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRoleID } from '../value-objects/user-role-id.value-object';
import { Role } from './role.entity';
import { User } from './user.entity';

@Entity()
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  user_role_id: UserRoleID;

  @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Role, { cascade: true, onDelete: 'CASCADE' })
  role: Role;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
