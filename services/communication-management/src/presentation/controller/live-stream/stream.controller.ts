import { Body, ConsoleLogger, Controller, Get, HttpCode, Logger, OnModuleInit, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateStreamCommand } from 'src/application/commands/live-stream/create-stream.command';
// import { StartStreamCommand } from 'src/application/commands/live-stream/start-stream.command';
// import { StopStreamCommand } from 'src/application/commands/live-stream/stop-stream.command';
// import { UpdateStreamCommand } from 'src/application/commands/live-stream/update-stream.command';
// import { PauseStreamCommand } from 'src/application/commands/live-stream/pause-stream.command';
// import { ResumeStreamCommand } from 'src/application/commands/live-stream/resume-stream.command';
import { ScheduleStreamCommand } from 'src/application/commands/live-stream/schedule-stream.command';
// import { CreateAndStartStreamCommand } from 'src/application/commands/live-stream/create-and-start-stream.command';
// import { GetAllStreamsQuery } from 'src/application/queries/live-stream/get-all-streams.query';
// import { GetStreamQuery } from 'src/application/queries/live-stream/get-stream.query';
// import { GetStreamsByUserIdQuery } from 'src/application/queries/live-stream/get-streams-by-user-id.query';
import { CreateStreamDto } from 'src/presentation/dto/live-stream/create-stream.dto';
import { StartStreamDto } from 'src/presentation/dto/live-stream/start-stream.dto';
import { ScheduleStreamDto } from 'src/presentation/dto/live-stream/schedule-stream.dto';
// import { CreateAndStartStreamDto } from 'src/presentation/dto/live-stream/create-and-start-stream.dto';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Roles } from 'src/presentation/decorators/roles.decorator';
import { CurrentUserId } from 'src/presentation/decorators/currentUserId.decorater';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { RolesGuard } from 'src/presentation/guards/roles.guard';
import { StartScheduledStreamCommand } from 'src/application/commands/live-stream/start-scheduled-stream.command';
import { StartScheduledStreamHandler } from 'src/application/handlers/live-stream/start-scheduled-stream.command-handler';
import { EndStreamCommand } from 'src/application/commands/live-stream/end-stream.command';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GetAllStreamsQuery } from 'src/application/queries/live-stream/get-all-streams.query';
import { GetActiveStreamsQuery } from 'src/application/queries/live-stream/get-active-streams.query';
import { GetInActiveStreamsQuery } from 'src/application/queries/live-stream/get-inactive-streams.query';
import { MediasoupService } from 'src/infrastructure/mediasoup/mediasoup.service';
import * as mediasoup from 'mediasoup';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetStreamQuery } from 'src/application/queries/live-stream/get-stream.query';
import { StartStreamCommand } from 'src/application/commands/live-stream/start-stream.command';
import { GetStreamByEventIdQuery } from 'src/application/queries/live-stream/get-stream-by-event-id.query';

@Controller('streams')
export class StreamController {
  private readonly logger = new Logger(StreamController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly mediasoupService: MediasoupService
  ) { }


  @Post('schedule')
  @ApiOperation({ description: 'Schedule a new stream' })
  @HttpCode(201)
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async scheduleStream(
    @CurrentUserId() user: any,
    @Body() scheduleStreamDto: ScheduleStreamDto,
  ): Promise<any> {
    const userId = user.user.user_id.toString();
    const { eventId, scheduledDate, scheduledTime, timezone } = scheduleStreamDto;
    console.log("Stream DTO : ", scheduleStreamDto)

    return this.commandBus.execute(
      new ScheduleStreamCommand(
        userId,
        eventId,
      ),
    );
  }

  @MessagePattern('schedule-stream')
  async handleKafkaPayload(@Payload() payload: CreateStreamDto) {
    console.log(payload)
    this.logger.log('Received Kafka message to schedule stream.');
    try {
      await this.commandBus.execute(new ScheduleStreamCommand(payload.userId, payload.eventId));
      this.logger.log('Stream sent successfully.');

      return { message: 'Stream sent from Kafka payload successfully.' };
    } catch (error) {
      this.logger.error('Failed to send stream from Kafka payload', error.stack);
      return { message: 'Failed to send stream from Kafka payload.' };
    }
  }


  // @Patch(':id')
  // async updateStream(
  //   @Param('id') streamId: string,
  //   @Body() updateStreamDto: any,
  // ) {
  //   const { url, status } = updateStreamDto;
  //   return this.commandBus.execute(
  //     new UpdateStreamCommand(streamId, url, status),
  //   );
  // }



  @Get(':id')
  async getStream(@Param('id') streamId: string) {
    return this.queryBus.execute(new GetStreamQuery(streamId));
  }

  @Get(':eventId')
  async getStreamByEventId(@Param('eventId') streamId: string) {
    return this.queryBus.execute(new GetStreamByEventIdQuery(streamId));
  }

  @Get()
  @ApiOperation({ summary: 'Get all streams' })
  async getAllStreams() {
    return this.queryBus.execute(new GetAllStreamsQuery());
  }


  @Get('inactive')
  @ApiOperation({ summary: 'Get all inactive streams' })
  async getInactiveStreams() {
    return this.queryBus.execute(new GetInActiveStreamsQuery());
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active streams' })
  async getActiveStreams() {
    return this.queryBus.execute(new GetActiveStreamsQuery());
  }

  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/start')
  async startStream(
    @Param('id') streamId: string,
    @Body() startStreamDto: StartStreamDto,
    @CurrentUserId() user: any,
  ) {
    const { source } = startStreamDto;
    const userId = user.user.user_id.toString();

    try {
      const result = await this.commandBus.execute(new StartStreamCommand(streamId, userId));

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

  @Post(':streamId/end')
  @ApiOperation({
    summary: 'End a live stream',
    description: 'Stops broadcasting and transitions a live stream to ENDED status'
  })
  @ApiParam({
    name: 'streamId',
    description: 'ID of the stream to end',
    example: '9ea675ab-19bc-440d-808e-842efbbc467'
  })
  @ApiBearerAuth('access-token')
  @Roles('User')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async endStream(
    @CurrentUserId() user: any,
    @Param('streamId') streamId: string,
  ): Promise<any> {
    const userId = user.user.user_id.toString();
    return this.commandBus.execute(
      new EndStreamCommand(userId, streamId)
    );
  }


  // @Post(':id/pause')
  // async pauseStream(@Param('id') streamId: string) {
  //   const result = await this.commandBus.execute(
  //     new PauseStreamCommand(streamId),
  //   );

  //   return {
  //     success: true,
  //     message: `Stream ${streamId} paused successfully`,
  //     data: result,
  //   };
  // }

  // @Post(':id/resume')
  // async resumeStream(@Param('id') streamId: string) {
  //   const result = await this.commandBus.execute(
  //     new ResumeStreamCommand(streamId),
  //   );

  //   return {
  //     success: true,
  //     message: `Stream ${streamId} resumed successfully`,
  //     data: result,
  //   };
  // }


}