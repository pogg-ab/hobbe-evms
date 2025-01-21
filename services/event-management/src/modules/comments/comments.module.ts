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

@Module({
  
    imports: [
      AutomapperModule,
      TypeOrmModule.forFeature([Comments]),
      CqrsModule,
    ],
    controllers: [
      CommentsController,
    ],
    providers: [
      CommentsServices,
      SocketIo,
      CommentsProfile,
      CreateCommentsCommandHandler,
      FindOneCommentsQueryHandler,
      FindByEventCommentsQueryHandler,
      UpdateCommentsCommandHandler,
      RemoveCommentsCommandHandler,
      {
        provide: COMMENTS_REPOSITORY_TOKEN,
        useClass: CommentsRepositoryImpl,
      },
    ],
    exports: [COMMENTS_REPOSITORY_TOKEN], // Export for use in other modules
  })
  export class CommentsModule {}
  
