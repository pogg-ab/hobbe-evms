import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateStreamCommand } from 'src/application/commands/live-stream/create-stream.command';
import { StartStreamCommand } from 'src/application/commands/live-stream/start-stream.command';
import { StopStreamCommand } from 'src/application/commands/live-stream/stop-stream.command';
import { UpdateStreamCommand } from 'src/application/commands/live-stream/update-stream.command';
import { GetAllStreamsQuery } from 'src/application/queries/live-stream/get-all-streams.query';
import { GetStreamQuery } from 'src/application/queries/live-stream/get-stream.query';
import { GetStreamsByUserIdQuery } from 'src/application/queries/live-stream/get-streams-by-user-id.query';
import { CreateStreamDto } from 'src/presentation/dto/live-stream/create-stream.dto';
import { StartStreamDto } from 'src/presentation/dto/live-stream/start-stream.dto';

@Controller('streams')
export class StreamController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Post()
  async createStream(@Body() createStreamDto: CreateStreamDto) {
    const { userId, eventId, startDate, endDate } = createStreamDto;

    return this.commandBus.execute(
      new CreateStreamCommand(userId, eventId, startDate, endDate),
    );
  }

  @Patch(':id')
  async updateStream(
    @Param('id') streamId: string,
    @Body() updateStreamDto: any,
  ) {
    const { url, status } = updateStreamDto;
    return this.commandBus.execute(
      new UpdateStreamCommand(streamId, url, status),
    );
  }

  @Get(':id')
  async getStream(@Param('id') streamId: string) {
    return this.queryBus.execute(new GetStreamQuery(streamId));
  }

  @Get()
  async getAllStreams() {
    return this.queryBus.execute(new GetAllStreamsQuery());
  }

  @Post(':id/start')
  async startStream(
    @Param('id') streamId: string,
    @Body() startStreamDto: StartStreamDto,
  ) {
    const { source } = startStreamDto;

    try {
      const result = await this.commandBus.execute(new StartStreamCommand(streamId, source));

      return {
        success: true,
        message: `Stream ${streamId} started successfully`,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to start stream: ${error.message}`,
        data: null,
      };
    }
  }

  @Post(':id/stop')
  async stopStream(@Param('id') streamId: string) {
    const result = await this.commandBus.execute(
      new StopStreamCommand(streamId),
    );

    return result;
  }

  @Get('user/:userId')
  async getStreamsByUserId(@Param('userId') userId: string) {
    return this.queryBus.execute(new GetStreamsByUserIdQuery(userId));
  }
}
