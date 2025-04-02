import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientKafka, ClientsModule } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from 'src/application/services/auth.service';
import { AdminUserAuth } from 'src/domain/entities/admin-user-auth.entity';
import { AdminUserRole } from 'src/domain/entities/admin-user-role.entity';
import { AdminUser } from 'src/domain/entities/admin-user.entity';
import { Auth } from 'src/domain/entities/auth.entity';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { UserRole } from 'src/domain/entities/user-role.entity';
import { User } from 'src/domain/entities/user.entity';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { kafkaConfig } from 'src/infrastructure/kafka/kafka.config';
import { kafkaProducerConfig } from 'src/infrastructure/kafka/kafka.producer.config';
import { MessageProducerService } from 'src/infrastructure/kafka/message.producer.service';
import { NotificationConfigService } from 'src/infrastructure/notification-config.service';
import { UserRepositoryImpl } from 'src/infrastructure/persistence/repositories/user.repository.impl';
import { AuthController } from 'src/presentation/controllers/auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { FOLLOWER_REPOSITORY_TOKEN } from 'src/domain/repositories/follower.repository.token';
import { FollowerRepositoryImpl } from 'src/infrastructure/persistence/repositories/follower.repository.impl';
import { Follower } from 'src/domain/entities/follower.entity';
import { ElasticsearchConfig } from 'src/infrastructure/elasticsearch/elasticsearch.config';
import { DeepLinkController } from 'src/presentation/controllers/deep-link.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      AdminUser,
      UserRole,
      AdminUserRole,
      Auth,
      AdminUserAuth,
      PersonalAccount,
      OrganizationalAccount,
      Follower
    ]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    ClientsModule.register([
      {
        name: 'KAFKA_PRODUCER',
        transport: kafkaProducerConfig.transport,
        options: kafkaProducerConfig.options,
      },
    ]),
  ],
  providers: [
    AuthService,
    ElasticsearchConfig,
    JwtStrategy,
    MessageProducerService,
    NotificationConfigService,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepositoryImpl,
    },
    {
      provide: FOLLOWER_REPOSITORY_TOKEN,
      useClass: FollowerRepositoryImpl,
    },
    {
      provide: 'KAFKA_CONSUMER',
      useFactory: async () => {
        const client = new ClientKafka(kafkaConfig.options);
        try {
          await client.connect();
          return client;
        } catch (error) {
          console.error('Error connecting to Kafka:', error);
          throw error;
        }
      },
    },
  ],
  controllers: [AuthController, DeepLinkController],
})
export class AuthModule { }
