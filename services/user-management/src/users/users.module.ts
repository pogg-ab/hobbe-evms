// src/modules/users.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateUserHandler } from 'src/application/handlers/create-user.handler';
import { DeleteUserHandler } from 'src/application/handlers/delete-user.handler';
import { GetAllUsersHandler } from 'src/application/handlers/get-all-users.handler';
import { GetUserByIdHandler } from 'src/application/handlers/get-user-by-id.handler';
import { UpdateUserHandler } from 'src/application/handlers/update-user.handler';
import { User } from 'src/domain/entities/user.entity';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { UserRepositoryImpl } from 'src/infrastructure/persistence/repositories/user.repository.impl';
import { UsersService } from '../application/services/users.service';
import { UsersController } from '../presentation/controllers/users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ClientsModule.register([
      {
        name: 'EVENT_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'event-management',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'event-management-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    CreateUserHandler,
    UpdateUserHandler,
    GetAllUsersHandler,
    GetUserByIdHandler,
    DeleteUserHandler,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepositoryImpl,
    },
  ],
})
export class UsersModule {}
