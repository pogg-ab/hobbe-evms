import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PermissionID } from '../value-objects/permission-id.value-object';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  permission_id: PermissionID;

  @Column({ unique: true })
  action: string;

  @Column({ unique: true })
  resource: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
