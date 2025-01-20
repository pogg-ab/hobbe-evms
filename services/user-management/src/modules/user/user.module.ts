import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FindAllUsersQueryHandler } from 'src/application/handlers/user/find-all-users.query-handler';
import { FindUserByIdQueryHandler } from 'src/application/handlers/user/find-user-by-id.query-handler';
import { UserService } from 'src/application/services/user.service';
import { User } from 'src/domain/entities/user.entity';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { UserRepositoryImpl } from 'src/infrastructure/persistence/repositories/user.repository.impl';
import { UserController } from 'src/presentation/controllers/user.controller';

@Module({
    imports: [AutomapperModule, TypeOrmModule.forFeature([User]), CqrsModule],
    controllers: [UserController],
    providers: [
        UserService,
        FindAllUsersQueryHandler,
        FindUserByIdQueryHandler,
        {
            provide: USER_REPOSITORY_TOKEN,
            useClass: UserRepositoryImpl,
        },
    ],
})
export class UserModule { }
