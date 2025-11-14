import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ActionType {
  // --- User Management Actions
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CREATE_USER = 'CREATE_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  ASSIGN_ROLE = 'ASSIGN_ROLE',
  UPDATE_ROLE = 'UPDATE_ROLE',

  // --- Event Management Actions ---
  CREATE_EVENT = 'CREATE_EVENT',
  UPDATE_EVENT = 'UPDATE_EVENT',
  DELETE_EVENT = 'DELETE_EVENT',
  APPROVE_EVENT = 'APPROVE_EVENT',
  LIKE_EVENT = 'LIKE_EVENT',
  UNLIKE_EVENT = 'UNLIKE_EVENT',
  CREATE_COMMENT = 'CREATE_COMMENT',
  DELETE_COMMENT = 'DELETE_COMMENT',
  SCAN_TICKET_QR = 'SCAN_TICKET_QR',
}

export enum ActionResult {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

@Entity({ name: 'event_audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ type: 'uuid', nullable: true })
  actorId: string;

  @Column()
  actorType: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({
    type: 'enum',
    enum: ActionType,
  })
  actionType: ActionType;

  @Column()
  targetEntity: string;

  @Column({ type: 'uuid', nullable: true })
  targetEntityId: string;

  @Column({
    type: 'enum',
    enum: ActionResult,
  })
  result: ActionResult;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @Column()
  serviceName: string;
}
