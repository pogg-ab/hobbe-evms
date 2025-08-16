import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { CommentsController } from 'src/presentation/controllers/comments/comments.controller';
import { Comments } from 'src/domain/entities/comments.entity';
import { CommentsServices } from 'src/application/services/comments/commnets.service';
import { CreateCommentsCommandHandler } from 'src/application/handlers/comments/create-comments.handler';
import { COMMENTS_REPOSITORY_TOKEN } from 'src/domain/repositories/comments/comments.repository.token';
import { CommentsRepositoryImpl } from 'src/infrastructure/persistence/repositories/comments.repository.impl';
import { CommentsProfile } from 'src/application/mappers/comments.profile';
import { FindOneCommentsQueryHandler } from 'src/application/handlers/comments/find-one-comments.handler';
import { FindByEventCommentsQueryHandler } from 'src/application/handlers/comments/find-by-event-comments.handler';
import { UpdateCommentsCommandHandler } from 'src/application/handlers/comments/update.commnets.handler';
import { RemoveCommentsCommandHandler } from 'src/application/handlers/comments/remove-comments.handler';
import { SocketIo } from 'src/infrastructure/socket-io/socket.gateway';
import { UserInfoService } from 'src/application/services/user-info/user-info.service';
import { ClientsModule } from '@nestjs/microservices';
import { kafkaProducerConfig } from 'src/infrastructure/kafka/kafka.config';
import { kafkaUserInfoConfig } from 'src/infrastructure/kafka/kafka.user-info.config';

@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature([Comments]),
    CqrsModule,
    ClientsModule.register([
      {
        name: 'KAFKA_VALIDATE_USER_SERVICE',
        transport: kafkaProducerConfig.transport,
        options: kafkaProducerConfig.options,
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_USER_SERVICE',
        useFactory: async () => ({
          transport: kafkaUserInfoConfig.transport,
          options: kafkaUserInfoConfig.options,
        }),
      },
    ]),
  ],
  controllers: [CommentsController],
  providers: [
    CommentsServices,
    SocketIo,
    CommentsProfile,
    CreateCommentsCommandHandler,
    FindOneCommentsQueryHandler,
    FindByEventCommentsQueryHandler,
    UpdateCommentsCommandHandler,
    RemoveCommentsCommandHandler,
    UserInfoService, // Assuming UserInfoService is defined and imported
    {
      provide: COMMENTS_REPOSITORY_TOKEN,
      useClass: CommentsRepositoryImpl,
    },
  ],
  exports: [COMMENTS_REPOSITORY_TOKEN], // Export for use in other modules
})
export class CommentsModule {}
