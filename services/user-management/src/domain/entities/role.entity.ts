import {
  Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn
} from 'typeorm';
import { RolePermission } from './role-permission.entity';
import { AutoMap } from '@automapper/classes'; // <-- IMPORT THIS

@Entity({ name: 'role' })
export class Role {
  @AutoMap() // <-- ADD THIS
  @PrimaryGeneratedColumn('uuid')
  role_id: string;

  @AutoMap() // <-- ADD THIS
  @Column({ unique: true })
  name: string;

  @AutoMap() // <-- ADD THIS
  @Column({ nullable: true })
  description: string;

  @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
  rolePermissions: RolePermission[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}