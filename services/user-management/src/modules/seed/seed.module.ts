import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SeedService } from '../../application/services/seed.service';
import { Permission } from 'src/domain/entities/permission.entity';
import { Role } from 'src/domain/entities/role.entity';
import { AdminUser } from 'src/domain/entities/admin-user.entity';
import { AdminUserRole } from 'src/domain/entities/admin-user-role.entity';
import { RolePermission } from 'src/domain/entities/role-permission.entity';
import { AdminUserAccount } from 'src/domain/entities/admin-user-account.entity';
import { SystemSetting } from 'src/domain/entities/system-setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permission,
      Role,
      AdminUser,
      AdminUserRole,
      RolePermission,
      AdminUserAccount,
       SystemSetting,
    ]),
    ClientsModule.register([
      {
        name: 'COMMUNICATION_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'user-seeder-producer',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },
          consumer: {
            groupId: 'user-seeder-consumer-group',
          },
        },
      },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}