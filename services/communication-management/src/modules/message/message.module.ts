import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetConversationHandler } from 'src/application/handlers/messages/get-conversaton.handler';
import { SendMessageHandler } from 'src/application/handlers/messages/send-message.hanler';
import { MessageProfile } from 'src/application/mappers/message.profile';
import { Message } from 'src/domain/entities/message.entity';
import { MessagesGateway } from 'src/infrastructure/socket-io/messages.gateway';
import { MessagesController } from 'src/presentation/controller/messages/messages.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Message]),
        CqrsModule,
        AutomapperModule.forRoot({ strategyInitializer: classes() }),
      ],
      controllers: [MessagesController],
      providers: [
        MessagesGateway,
        SendMessageHandler,
        GetConversationHandler,
        MessageProfile,
      ],
})
export class MessageModule {}
