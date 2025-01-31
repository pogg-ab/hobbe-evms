import { AutomapperModule } from "@automapper/nestjs";
import { Inject, Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
import { ClientKafka, ClientsModule } from "@nestjs/microservices";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CreateChatCommandHandler } from "src/application/handlers/chat/create-chat.handler";
import { ChatProfile } from "src/application/mappers/create-chat.profile";
import { ChatService } from "src/application/services/chat/chat.service";
import { UserValidationService } from "src/application/services/chat/user-validation.service";
import { Chat } from "src/domain/entities/chat.entity";
import { kafkaProducerConfig } from "src/infrastructure/kafka/kafka.config";
import { KafkaProducerService } from "src/infrastructure/kafka/kafka.producer.servicce";
import { ChatController } from "src/presentation/controller/chat/chat.controller";
import { JwtStrategy } from "./jwt.strategy";
import { CHAT_REPOSITORY_TOKEN } from "src/domain/repositories/chat/chat.repository.token";
import { ChatRepositoryImpl } from "src/infrastructure/persistance/repository/chat.repository.impl";
import { E2EEModule } from "../e2ee/e2ee.module";
import { E2eeService } from "src/application/services/e2ee/e2ee.service";
import { FindOneQueryHandler } from "src/application/handlers/chat/find-one-chat.handler";
import { UpdateChatCommandHandler } from "src/application/handlers/chat/update-chat.handler";


@Module({
  imports: [
    AutomapperModule,
    PassportModule,
    E2EEModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
    ClientsModule.register([
      {
        name: 'KAFKA_PRODUCER',
        transport: kafkaProducerConfig.transport,
        options: kafkaProducerConfig.options,
      },
    ]),
    TypeOrmModule.forFeature([Chat]),
    CqrsModule,
  ],
  controllers: [
   ChatController

  ],
  providers: [
    ChatService,
    E2eeService,
    CreateChatCommandHandler,
    FindOneQueryHandler,
    UpdateChatCommandHandler,
    KafkaProducerService,
    ChatProfile,
    UserValidationService,
    JwtStrategy,
    {
      provide: CHAT_REPOSITORY_TOKEN,
      useClass: ChatRepositoryImpl,
    },
  ],
})
export class ChatModule {
  constructor(@Inject('KAFKA_PRODUCER') private client: ClientKafka) { }

  async onModuleInit() {
    this.client.subscribeToResponseOf('validateUser');
    await this.client.connect();
  }
}
