import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateStreamHandler } from 'src/application/handlers/live-stream/create-stream.command-handler';
import { GetAllStreamsHandler } from 'src/application/handlers/live-stream/get-all-streams.query-handler';
import { GetStreamHandler } from 'src/application/handlers/live-stream/get-stream.query-handler';
import { GetStreamsByUserIdQueryHandler } from 'src/application/handlers/live-stream/get-streams-by-user-id.query-handler';
import { StartStreamCommandHandler } from 'src/application/handlers/live-stream/start-stream.command-handler';
import { StopStreamCommandHandler } from 'src/application/handlers/live-stream/stop-stream.command-handler';
import { UpdateStreamHandler } from 'src/application/handlers/live-stream/update-stream.command-handler';
import { GetStreamsByUserIdQuery } from 'src/application/queries/live-stream/get-streams-by-user-id.query';
import { StreamService } from 'src/application/services/live-stream/stream.service';
import { Stream } from 'src/domain/entities/stream.entity';
import { STREAM_REPOSITORY_TOKEN } from 'src/domain/repositories/live-stream/stream.repository.token';
import { FluentFFmpegService } from 'src/infrastructure/ffmpeg/fluent-ffmpeg.service';
import { NodeMediaService } from 'src/infrastructure/media-server/media-server.service';
import { StreamRepositoryImpl } from 'src/infrastructure/persistance/repository/stream.repository.impl';
import { StreamController } from 'src/presentation/controller/live-stream/stream.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Stream]), CqrsModule],
  controllers: [StreamController],
  providers: [
    NodeMediaService,
    StreamService,
    FluentFFmpegService,
    CreateStreamHandler,
    UpdateStreamHandler,
    GetStreamHandler,
    GetAllStreamsHandler,
    StartStreamCommandHandler,
    GetStreamsByUserIdQueryHandler,
    StopStreamCommandHandler,
    {
      provide: STREAM_REPOSITORY_TOKEN,
      useClass: StreamRepositoryImpl,
    },
  ],
})
export class StreamModule { }
