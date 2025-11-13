import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Defines the standardized types of actions that can be logged.
 * This enum should be kept consistent across all microservices.
 */
export enum ActionType {
  // --- User Management Actions (for consistency) ---
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
  APPROVE_EVENT = 'APPROVE_EVENT', // For status changes like Draft -> Approved
  LIKE_EVENT = 'LIKE_EVENT',
  UNLIKE_EVENT = 'UNLIKE_EVENT',
  CREATE_COMMENT = 'CREATE_COMMENT',
  DELETE_COMMENT = 'DELETE_COMMENT',
  SCAN_TICKET_QR = 'SCAN_TICKET_QR',
}

/**
 * Defines the outcome of a logged action.
 */
export enum ActionResult {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

@Entity({ name: 'event_audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The timestamp of when the event occurred.
   */
  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;

  /**
   * The ID of the user or system that performed the action.
   * Can be null for actions performed by unauthenticated users or system processes.
   */
  @Column({ type: 'uuid', nullable: true }) // <-- THE FIX IS HERE
  actorId: string;

  /**
   * The type of the actor (e.g., 'user', 'admin', 'guest', 'system').
   */
  @Column()
  actorType: string;

  /**
   * The IP address from which the action was initiated.
   */
  @Column({ nullable: true })
  ipAddress: string;

  /**
   * The specific action that was performed, using the ActionType enum.
   */
  @Column({
    type: 'enum',
    enum: ActionType,
  })
  actionType: ActionType;

  /**
   * The primary entity being acted upon (e.g., 'Event', 'Comment').
   */
  @Column()
  targetEntity: string;

  /**
   * The ID of the specific entity instance being affected.
   */
  @Column({ type: 'uuid', nullable: true })
  targetEntityId: string;

  /**
   * The outcome of the action (SUCCESS or FAILURE).
   */
  @Column({
    type: 'enum',
    enum: ActionResult,
  })
  result: ActionResult;

  /**
   * A JSON object for storing contextual data, like request body or error messages.
   */
  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @Column() 
  serviceName: string;
}