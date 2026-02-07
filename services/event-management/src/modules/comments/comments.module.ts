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
import { ClientsModule, Transport } from '@nestjs/microservices'; // <-- Ensure Transport is imported
import { kafkaProducerConfig } from 'src/infrastructure/kafka/kafka.config';
import { kafkaUserInfoConfig } from 'src/infrastructure/kafka/kafka.user-info.config';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature([Comments]),
    CqrsModule,
    AuditLogModule,
    JwtModule.register({}),
    ClientsModule.register([
      // This is one of your existing clients
      {
        name: 'KAFKA_VALIDATE_USER_SERVICE',
        transport: kafkaProducerConfig.transport,
        options: kafkaProducerConfig.options,
      },
      // --- THIS IS THE FIX ---
      // Add the KAFKA_PRODUCER client that the interceptor needs
      {
        name: 'KAFKA_PRODUCER',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'event-management-producer',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },
        },
      },
    ]),
    ClientsModule.registerAsync([
      // This is your other existing client
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
    UserInfoService,
    {
      provide: COMMENTS_REPOSITORY_TOKEN,
      useClass: CommentsRepositoryImpl,
    },
  ],
  exports: [COMMENTS_REPOSITORY_TOKEN],
})
export class CommentsModule {}