import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { AdminUser } from './admin-user.entity';

@Entity('admin_user_sessions')
export class AdminUserSession {
  @PrimaryGeneratedColumn('uuid')
  session_id: string;

  @ManyToOne(() => AdminUser, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_user_id' })
  adminUser: AdminUser;

  @Column({ type: 'uuid' })
  admin_user_id: string;

  @Column({ type: 'timestamptz' })
  last_activity: Date;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'inet', nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}