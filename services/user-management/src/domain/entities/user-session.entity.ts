import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { AdminUser } from './admin-user.entity';

@Entity({ name: 'user_sessions' })
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  session_id: string;

  // --- This is the key change for supporting both user types ---

  // This column will hold the ID for REGULAR users. It must be nullable.
  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  // This column will hold the ID for ADMIN users. It must be nullable.
  @Column({ type: 'uuid', nullable: true })
  admin_user_id: string;

  // -----------------------------------------------------------

  // This defines the optional relationship to the User table.
  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // This defines the optional relationship to the AdminUser table.
  @ManyToOne(() => AdminUser, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_user_id' })
  adminUser: AdminUser;


  @Column({ type: 'inet', nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'timestamptz' })
  last_activity: Date;

  @Column({ default: true })
  is_active: boolean;
}