import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
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
}
