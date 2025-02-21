import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateStreamCommand } from 'src/application/commands/live-stream/create-stream.command';
import { UpdateStreamCommand } from 'src/application/commands/live-stream/update-stream.command';
import { GetAllStreamsQuery } from 'src/application/queries/live-stream/get-all-streams.query';
import { GetStreamQuery } from 'src/application/queries/live-stream/get-stream.query';
import { CreateStreamDto } from 'src/presentation/dto/live-stream/create-stream.dto';

@Controller('streams')
export class StreamController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createStream(@Body() createStreamDto: CreateStreamDto) {
    const { url, userId, eventId } = createStreamDto;
    return this.commandBus.execute(
      new CreateStreamCommand(url, userId, eventId),
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
}
