// src/audit-log/audit-log.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

// --- ENUMS for Type-Safety and Standardization ---

/**
 * Defines the possible outcomes of a logged action.
 */
export enum ActionResult {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

/**
 * Defines who or what performed the action.
 */
export enum ActorType {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
}

/**
 * Defines the specific actions relevant to the payment-management service.
 */
export enum ActionType {
  // Payment Actions
  CREATE_PAYMENT_INTENT = 'CREATE_PAYMENT_INTENT',
  CONFIRM_PAYMENT = 'CONFIRM_PAYMENT',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILURE = 'PAYMENT_FAILURE',

  // Refund Actions
  PROCESS_REFUND = 'PROCESS_REFUND',
  REFUND_SUCCESS = 'REFUND_SUCCESS',
  REFUND_FAILURE = 'REFUND_FAILURE',

  // Administrative / Query Actions
  VIEW_TRANSACTION_HISTORY = 'VIEW_TRANSACTION_HISTORY',
  VIEW_PAYMENT_DETAILS = 'VIEW_PAYMENT_DETAILS',
  EXPORT_PAYMENT_LOGS = 'EXPORT_PAYMENT_LOGS', // For when we log the export action itself
}

// --- The Refactored AuditLog Entity ---

@Entity({ name: 'payment_audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  actorId: string; // Standardized to camelCase, nullable for anonymous/system actions

  @Column({
    type: 'enum',
    enum: ActorType,
    default: ActorType.USER,
  })
  actorType: ActorType;

  @Column({
    type: 'enum',
    enum: ActionType,
  })
  actionType: ActionType;

  @Column({
    type: 'enum',
    enum: ActionResult,
    default: ActionResult.SUCCESS,
  })
  result: ActionResult;

  @Column({ nullable: true })
  targetEntity: string; // e.g., 'Transaction', 'Refund'

  @Column({ nullable: true })
  targetId: string; // The ID of the specific transaction or refund

  @Column({ type: 'jsonb', nullable: true })
  details: object;

  @Column()
  serviceName: string; // e.g., 'payment-management'

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date; // Standardized to camelCase
}