// src/domain/entities/user.entity.ts

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PersonalAccountID } from '../value-objects/personal-account-id.value-object';
import { UserID } from '../value-objects/user-id.value-object';
import { PersonalAccount } from './personal-account.entity';
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: UserID;

  @Column({ unique: true })
  user_name: string;

  @Column()
  password: string;

  @OneToOne(() => PersonalAccount, {
    cascade: true,
  })
  @JoinColumn({ name: 'personal_account_id' })
  personal_account: PersonalAccountID;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_date: Date;

  @Column({ nullable: true })
  updated_by: string;

  @UpdateDateColumn()
  updated_date: Date;
}
