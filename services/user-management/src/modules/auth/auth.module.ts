import { forwardRef, Module } from '@nestjs/common';
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
import { CqrsModule } from '@nestjs/cqrs';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { LoginWithOAuthHandler } from 'src/application/handlers/sso/LoginWithOAuthHandler';
import { OAuthProvider } from 'src/domain/entities/oauth-provider.entity';
import { GithubStrategy } from './strategies/github.strategy';

// --- IMPORTS FROM YOUR FEATURE BRANCH ---
import { AdminJwtStrategy } from './admin-jwt.strategy';
import { AuditLogModule } from '../audit-log/audit-log.module';
// Note: We don't import AdminAuthGuard here as it's a legacy file we might not need. Let's see.
import { PermissionsGuard } from 'src/presentation/guards/permissions.guard';
import { UserSecuritySetting } from 'src/domain/entities/user-security-setting.entity';
import { AdminUserSecuritySetting } from 'src/domain/entities/admin-user-security-setting.entity';
import { SessionGuard } from 'src/presentation/guards/session.guard';
import { UserSession } from 'src/domain/entities/user-session.entity';
import { AdminUserSession } from 'src/domain/entities/admin-user-session.entity';

import { GuestSession } from 'src/domain/entities/guest-session.entity';
import { GuestUserService } from 'src/application/services/guest-user.service';
import { ConfigModule } from '@nestjs/config';
import { MfaService } from 'src/application/services/mfa.service';
import { MfaController } from 'src/presentation/controllers/mfa.controller';
import { SystemSettingsService } from 'src/application/services/system-settings.service';
import { SystemSettingsController } from 'src/presentation/controllers/system-settings.controller';
import { SystemSetting } from 'src/domain/entities/system-setting.entity';
import { UniversalAuthGuard } from 'src/presentation/guards/universal-auth.guard';
import { AdminGoogleStrategy } from './strategies/admin-google.strategy';
import { AdminFacebookStrategy } from './strategies/admin-facebook.strategy';
import { AdminGitHubStrategy } from './strategies/admin-github.strategy';
import { AdminAuthGuard } from 'src/presentation/guards/admin-auth.guard';
import { AdminAlertsController } from 'src/presentation/controllers/admin-alerts.controller'; 
import { AdminAlertsService } from 'src/application/services/admin-alerts.service';      
import { AdminAlert } from 'src/domain/entities/admin-alert.entity';
import { AdminAlertLog } from 'src/domain/entities/admin-alert-log.entity';
import { AdminAlertSubscription } from 'src/domain/entities/admin-alert-subscription.entity';
import { KafkaProducerModule } from 'src/infrastructure/kafka/kafka-producer.module';
import { UserAlertSubscription } from 'src/domain/entities/user-alert-subscription.entity';
@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      User,
      AdminUser,
      UserRole,
      AdminUserRole,
      Auth,
      OAuthProvider,
      AdminUserAuth,
      PersonalAccount,
      OrganizationalAccount,
      Follower,
      UserSecuritySetting, 
       AdminUserSecuritySetting,
      UserSession,  
      AdminUserSession,       
      GuestSession,
      ConfigModule, 
      SystemSetting,   
      AdminAlert,
      AdminAlertLog,   
      AdminAlertSubscription,  
      UserAlertSubscription,
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
    forwardRef(() => AuditLogModule), 
  ],
  providers: [
    AuthService,
    ElasticsearchConfig,
    JwtStrategy,
    AdminJwtStrategy, 
    GoogleStrategy,
    FacebookStrategy,
    GithubStrategy,
    MessageProducerService,
    NotificationConfigService,
    GuestUserService, 
    LoginWithOAuthHandler,
    PermissionsGuard, 
    SessionGuard,
    MfaService,  
    SystemSettingsService, 
    UniversalAuthGuard,  
    AdminGoogleStrategy,
    AdminFacebookStrategy,
    AdminGitHubStrategy,
    AdminAuthGuard,
    AdminAlertsService,
    KafkaProducerModule,
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
  controllers: [AuthController,  MfaController,  SystemSettingsController,AdminAlertsController,],
  exports: [
    AuthService,
    PermissionsGuard, 
    SessionGuard,
    MfaService,  
    SystemSettingsService,
    AdminAuthGuard, 
    UniversalAuthGuard,   
  ],
})
export class AuthModule {}