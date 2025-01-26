import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from 'src/application/services/auth.service';
import { AdminUserAuth } from 'src/domain/entities/admin-user-auth.entity';
import { AdminUserRole } from 'src/domain/entities/admin-user-role.entity';
import { AdminUser } from 'src/domain/entities/admin-user.entity';
import { Auth } from 'src/domain/entities/auth.entity';
import { Email } from 'src/domain/entities/email.entity';
import { UserRole } from 'src/domain/entities/user-role.entity';
import { User } from 'src/domain/entities/user.entity';
import { EMAIL_REPOSITORY_TOKEN } from 'src/domain/repositories/email.repository.token';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { kafkaConfig } from 'src/infrastructure/kafka/kafka.config';
import { EmailRepositoryImpl } from 'src/infrastructure/persistence/repositories/email.repository.impl';
import { UserRepositoryImpl } from 'src/infrastructure/persistence/repositories/user.repository.impl';
import { AuthController } from 'src/presentation/controllers/auth.controller';
import { EmailModule } from '../email/email.module';
import { JwtStrategy } from './jwt.strategy';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { SMS_REPOSITORY_TOKEN } from 'src/domain/repositories/sms.repository.token';
import { SMSRepositoryImpl } from 'src/infrastructure/persistence/repositories/sms.repository.impl';
import { SMSSenderService } from 'src/application/services/sms-sender.service';
import { EmailService } from 'src/application/services/email.service';
import { SMSProvider } from 'src/infrastructure/sms/sms.provider';
import { SMS } from 'src/domain/entities/sms.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      AdminUser,
      Email,
      UserRole,
      AdminUserRole,
      Auth,
      AdminUserAuth,
      PersonalAccount,
      OrganizationalAccount,
      SMS
    ]),
    PassportModule,
    EmailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    SMSSenderService,
    EmailService,
    SMSProvider,
    {
      provide: EMAIL_REPOSITORY_TOKEN,
      useClass: EmailRepositoryImpl,
    },
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepositoryImpl,
    },
    {
      provide: SMS_REPOSITORY_TOKEN,
      useClass: SMSRepositoryImpl,
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
export class AuthModule { }
