import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { AdminUserAccountModule } from './modules/admin-user-account/admin-user-account.module';
import { AuthModule } from './modules/auth/auth.module';
import { FavoritesModule } from './modules/favorite/favorite.module';
import { FollowerModule } from './modules/follower/follower.module';
import { OrganizationalAccountModule } from './modules/organizational-account/organizational-account.module';
import { PersonalAccountModule } from './modules/personal-account/personal-account.module';
import { RolePermissionModule } from './modules/role-permission/role-permission.module';
import { SubAccountModule } from './modules/sub-account/sub-account.module';
import { UserModule } from './modules/user/user.module';
import { UserAnayticsModule } from './modules/analytics/user-anaytics.module';
import { SeedModule } from './modules/seed/seed.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),
    AutomapperModule.forRoot([
      {
        name: 'default',
        strategyInitializer: classes(),
      },
    ]),
    DatabaseModule,
    CqrsModule,
    PersonalAccountModule,
    AuthModule,
    RolePermissionModule,
    OrganizationalAccountModule,
    AdminUserAccountModule,
    SubAccountModule,
    FollowerModule,
    UserModule,
    FavoritesModule,
    UserAnayticsModule,
     AuditLogModule,
    SeedModule,
  ],
})
export class AppModule {}
