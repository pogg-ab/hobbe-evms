import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
  } from 'typeorm';
  import { User } from './user.entity';
  import { FollowStatus } from '../value-objects/follow-status.value-object';
  
  @Entity()
  export class Follower {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'follower_user_id' })
    follower: User;
  
    @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'following_user_id' })
    following: User;
  
    @Column({
      type: 'enum',
      enum: FollowStatus,
      default: FollowStatus.PENDING,
    })
    status: FollowStatus;
  
    @Column({ default: false })
    is_mutual: boolean;
  
    @CreateDateColumn()
    created_date: Date;
  
    @UpdateDateColumn()
    updated_date: Date;
  
    @Column({ nullable: true })
    blocked_by: string;
  
    @Column({ nullable: true })
    blocked_at: Date;
  }
  