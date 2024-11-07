import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SocialMediaID } from '../value-objects/social-media-id.value-object';
import { OrganizationalAccount } from './organizational-account.entity';

@Entity()
export class SocialMedia {
  @PrimaryGeneratedColumn('uuid')
  social_media_id: SocialMediaID;

  @ManyToOne(() => OrganizationalAccount, { nullable: false })
  organizational_account_id: string;

  @Column()
  platform: string;

  @Column()
  url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  updated_by: string;
}
