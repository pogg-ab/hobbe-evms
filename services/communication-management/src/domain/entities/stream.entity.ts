import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StreamID } from '../value-objects/stream-id.value-object';

@Entity()
export class Stream {
  @PrimaryGeneratedColumn('uuid')
  id: StreamID;

  @Column()
  url: string;

  @Column()
  hlsOutputPath: string;

  @Column({
    type: 'enum',
    enum: ['inactive', 'active', 'completed'],
    default: 'inactive',
  })
  status: 'inactive' | 'active' | 'completed';

  @Column()
  userId: string;

  @Column()
  eventId: string;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @Column({ default: 0 })
  viewerCount: number;

  @Column({ default: false })
  isLive: boolean;

  @Column({ nullable: true })
  streamKey: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Column({ nullable: true })
  deletedBy: string;
}
