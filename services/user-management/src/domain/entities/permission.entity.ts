// src/domain/entities/permission.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { RolePermission } from './role-permission.entity';

@Entity({ name: 'permission' })
@Unique(['action', 'resource'])
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  permission_id: string;

  @Column()
  action: string;

  @Column()
  resource: string;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions: RolePermission[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
