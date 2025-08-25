import {
  CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn, Unique
} from 'typeorm';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity({ name: 'role_permission' })
// This is the key: it ensures a composite UNIQUE constraint on the foreign keys.
@Unique(['role', 'permission']) 
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  role_permission_id: string;

  // These relations are correct. They point to the other entities.
  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' }) 
  role: Role;

  @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permissionId' })
  permission: Permission;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}