import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OwnerID } from '../value-objects/owner-id.value-object';

@Entity()
export class Owner {
  @PrimaryGeneratedColumn('uuid')
  owner_id: OwnerID;

  @Column()
  owner_first_name: string;

  @Column()
  owner_sur_name: string;

  @Column({ unique: true })
  owner_email: string;

  @Column()
  owner_phone_number: string;

  @Column({ default: false })
  is_email_verified: boolean;

  @Column({ nullable: true, select: false })
  email_verification_token?: string;

  @Column({ nullable: true })
  email_verification_expires?: Date;

  @Column({ default: false })
  is_phone_number_verified: boolean;

  @Column({ nullable: true, select: false })
  phone_verification_token?: string;

  @Column({ nullable: true })
  phone_verification_expires?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  updated_by: string;
}
