import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Defines standardized action types. This is crucial for filtering in the admin dashboard.
 * We'll start with actions relevant to the user-management service.
 */
export enum ActionType {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',

  // User/Admin Management
  CREATE_USER = 'CREATE_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  
  CREATE_ADMIN = 'CREATE_ADMIN',
  UPDATE_ADMIN = 'UPDATE_ADMIN',
  DELETE_ADMIN = 'DELETE_ADMIN',

  // Roles & Permissions
  ASSIGN_ROLE = 'ASSIGN_ROLE',
  REVOKE_ROLE = 'REVOKE_ROLE',
  CREATE_ROLE = 'CREATE_ROLE',
  UPDATE_ROLE = 'UPDATE_ROLE',
  DELETE_ROLE = 'DELETE_ROLE',
  UPDATE_PERMISSION = 'UPDATE_PERMISSION',
  
  // General Access
  ACCESS_DATA = 'ACCESS_DATA',
}

/**
 * Defines the outcome of the action.
 */
export enum ActionResult {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

@Entity('user_audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz', comment: 'The UTC timestamp when the log was created' })
  timestamp: Date;

  @Index()
  // --- THIS IS THE CORRECTED LINE ---
  @Column({ type: 'varchar', length: 255, comment: 'ID or name of the actor (e.g., user UUID, username, or "system")' })
  actorId: string;

  @Column({ default: 'user', comment: 'Type of the actor, e.g., "user", "admin", "system"' })
  actorType: string;

  @Column({ nullable: true, comment: 'IP address of the request origin' })
  ipAddress: string;

  @Index()
  @Column({
    type: 'enum',
    enum: ActionType,
    comment: 'The specific type of action performed',
  })
  actionType: ActionType;

  @Column({ comment: 'The primary entity being affected, e.g., "User", "Role"' })
  targetEntity: string;

  @Index()
  @Column({ type: 'uuid', nullable: true, comment: 'The ID of the specific entity being affected' })
  targetEntityId: string;

  @Column({
    type: 'enum',
    enum: ActionResult,
    comment: 'The outcome of the action (success or failure)',
  })
  result: ActionResult;

  @Column({ type: 'jsonb', nullable: true, comment: 'Rich context like request body, params, or error messages' })
  details: Record<string, any>;

  @Column() 
  serviceName: string;
}