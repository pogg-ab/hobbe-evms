import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { AdminUserAccountModule } from './modules/admin-user-account/admin-user-account.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { OrganizationalAccountModule } from './modules/organizational-account/organizational-account.module';
import { PersonalAccountModule } from './modules/personal-account/personal-account.module';
import { RolePermissionModule } from './modules/role-permission/role-permission.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
    EmailModule,
    AdminUserAccountModule,
  ],
})
export class AppModule {}
