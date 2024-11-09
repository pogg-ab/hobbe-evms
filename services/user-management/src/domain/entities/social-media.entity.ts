import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrganizationalAccountID } from '../value-objects/organizational-account-id.value-object';
import { SocialMediaID } from '../value-objects/social-media-id.value-object';
import { OrganizationalAccount } from './organizational-account.entity';

@Entity()
export class SocialMedia {
  @PrimaryGeneratedColumn('uuid')
  social_media_id: SocialMediaID;

  @ManyToOne(() => OrganizationalAccount, {
    nullable: false,
    cascade: true,
  })
  @JoinColumn({ name: 'organizational_account_id' })
  organizational_account: OrganizationalAccountID;

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
