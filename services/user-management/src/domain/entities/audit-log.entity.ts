import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column()
  action: string;

  @Column()
  module: string;

  // --- ADD THIS NEW COLUMN ---
  @Column({ default: 'unknown' }) // Add a default value for safety
  serviceName: string; // Will store 'user-management', 'event-management', etc.
  // --- END OF NEW COLUMN ---

  @Column({ type: 'uuid', nullable: true })
  target_id: string;

  @Column({ type: 'jsonb', nullable: true })
  details: object;

  @Column({ nullable: true })
  ip_address: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}