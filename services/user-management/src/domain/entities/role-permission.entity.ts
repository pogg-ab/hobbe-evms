import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PermissionID } from '../value-objects/permission-id.value-object';
import { RoleID } from '../value-objects/role-id.value-object';
import { RolePermissionID } from '../value-objects/role-permission-id.value-object';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity()
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  role_permission_id: RolePermissionID;

  @ManyToOne(() => Role, { cascade: true, onDelete: 'CASCADE' })
  role: RoleID;

  @ManyToOne(() => Permission, { cascade: true, onDelete: 'CASCADE' })
  permission: PermissionID;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
