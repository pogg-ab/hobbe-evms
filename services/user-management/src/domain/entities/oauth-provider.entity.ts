import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Provider } from 'src/presentation/dtos/sso/oauth.dto';
@Entity()
export class OAuthProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.providers)
  user: User;

  @Column({ type: 'enum', enum: Provider, nullable: false })
  provider: Provider;

  @Column()
  providerId: string;

  @Column({ nullable: true })
  accessToken: string;

  @Column({ nullable: true })
  refreshToken: string;

 @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
