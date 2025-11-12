import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { Like } from 'src/domain/entities/likes.entity';
import { LikeController } from 'src/presentation/controllers/like/like.controller';
import { LikeEventService } from 'src/application/services/like/like-event.service';
import { LIKE_EVENT_TOKEN } from 'src/domain/repositories/like/like-event.repositort.token';
import { LikeEventRepositoryImpl } from 'src/infrastructure/persistence/repositories/like-event.repository.impl';
import { SocketIo } from 'src/infrastructure/socket-io/socket.gateway';
import { LikeEventCommandHandler } from 'src/application/handlers/like/like-event-handler';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices'; // <-- 1. IMPORT ClientsModule & Transport

@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature([Like]),
    CqrsModule,
    AuditLogModule,
    JwtModule.register({}),
    // 2. ADD THE ClientsModule to provide the KAFKA_PRODUCER
    ClientsModule.register([
      {
        name: 'KAFKA_PRODUCER',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'event-management-producer',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'], // Use environment variable
          },
        },
      },
    ]),
  ],
  controllers: [LikeController],
  providers: [
    LikeEventService,
    SocketIo,
    LikeEventCommandHandler,
    {
      provide: LIKE_EVENT_TOKEN,
      useClass: LikeEventRepositoryImpl,
    },
  ],
  exports: [LIKE_EVENT_TOKEN],
})
export class LikeModule {}