import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';


export enum ActionResult {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export enum ActorType {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
}

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
  EXPORT_PAYMENT_LOGS = 'EXPORT_PAYMENT_LOGS',
}


@Entity({ name: 'payment_audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  actorId: string;
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
  targetEntity: string;

  @Column({ nullable: true })
  targetId: string;

  @Column({ type: 'jsonb', nullable: true })
  details: object;

  @Column()
  serviceName: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}