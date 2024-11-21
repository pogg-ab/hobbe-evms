import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from 'src/application/services/auth.service';
import { Auth } from 'src/domain/entities/auth.entity';
import { Email } from 'src/domain/entities/email.entity';
import { UserRole } from 'src/domain/entities/user-role.entity';
import { User } from 'src/domain/entities/user.entity';
import { EMAIL_REPOSITORY_TOKEN } from 'src/domain/repositories/email.repository.token';
import { kafkaConfig } from 'src/infrastructure/kafka/kafka.config';
import { EmailRepositoryImpl } from 'src/infrastructure/persistence/repositories/email.repository.impl';
import { AuthController } from 'src/presentation/controllers/auth.controller';
import { EmailModule } from '../email/email.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Email, UserRole, Auth]),
    PassportModule,
    EmailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: EMAIL_REPOSITORY_TOKEN,
      useClass: EmailRepositoryImpl,
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
  controllers: [AuthController],
})
export class AuthModule {}
