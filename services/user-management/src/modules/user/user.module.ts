import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FindAllUsersQueryHandler } from 'src/application/handlers/user/find-all-users.query-handler';
import { FindUserByIdQueryHandler } from 'src/application/handlers/user/find-user-by-id.query-handler';
import { UpdateUserCommandHandler } from 'src/application/handlers/user/update-user.command-handler';
import { UserService } from 'src/application/services/user.service';
import { KYC } from 'src/domain/entities/kyc.entity';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { Owner } from 'src/domain/entities/owner.entity';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { SocialMedia } from 'src/domain/entities/social-media.entity';
import { User } from 'src/domain/entities/user.entity';
import { KYC_REPOSITORY_TOKEN } from 'src/domain/repositories/kyc.repository.token';
import { ORGANIZATIONAL_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/organizational-account.repository.token';
import { OWNER_REPOSITORY_TOKEN } from 'src/domain/repositories/owner.repository.token';
import { PERSONAL_ACCOUNT_REPOSITORY_TOKEN } from 'src/domain/repositories/personal-account.repository.token';
import { SOCIAL_MEDIA_REPOSITORY_TOKEN } from 'src/domain/repositories/social-media.repository.token';
import { USER_REPOSITORY_TOKEN } from 'src/domain/repositories/user.repository.token';
import { KYCRepositoryImpl } from 'src/infrastructure/persistence/repositories/kyc.repository.impl';
import { OrganizationalAccountRepositoryImpl } from 'src/infrastructure/persistence/repositories/organizational-account.repository.impl';
import { OwnerRepositoryImpl } from 'src/infrastructure/persistence/repositories/owner.repository.impl';
import { PersonalAccountRepositoryImpl } from 'src/infrastructure/persistence/repositories/personal-account.repository.impl';
import { SocialMediaRepositoryImpl } from 'src/infrastructure/persistence/repositories/social-media.repository.impl';
import { UserRepositoryImpl } from 'src/infrastructure/persistence/repositories/user.repository.impl';
import { UserController } from 'src/presentation/controllers/user.controller';

@Module({
    imports: [AutomapperModule, TypeOrmModule.forFeature([User, PersonalAccount, OrganizationalAccount, SocialMedia,
        Owner,
        KYC]), CqrsModule],
    controllers: [UserController],
    providers: [
        UserService,
        FindAllUsersQueryHandler,
        FindUserByIdQueryHandler,
        UpdateUserCommandHandler,
        {
            provide: USER_REPOSITORY_TOKEN,
            useClass: UserRepositoryImpl,
        },
        {
            provide: PERSONAL_ACCOUNT_REPOSITORY_TOKEN,
            useClass: PersonalAccountRepositoryImpl,
        },
        {
            provide: ORGANIZATIONAL_ACCOUNT_REPOSITORY_TOKEN,
            useClass: OrganizationalAccountRepositoryImpl,
        },
        {
            provide: OWNER_REPOSITORY_TOKEN,
            useClass: OwnerRepositoryImpl,
        },
        {
            provide: KYC_REPOSITORY_TOKEN,
            useClass: KYCRepositoryImpl,
        },
        {
            provide: SOCIAL_MEDIA_REPOSITORY_TOKEN,
            useClass: SocialMediaRepositoryImpl,
        },
    ],
})
export class UserModule { }
