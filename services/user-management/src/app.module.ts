import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationalAccountModule } from './modules/organizational-account/organizational-account.module';
import { PersonalAccountModule } from './modules/personal-account/personal-account.module';
// import { OrganizationalAccountModule } from './organizational-account/organizational-account.module';

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
    AdminModule,
    OrganizationalAccountModule,
  ],
})
export class AppModule {}
