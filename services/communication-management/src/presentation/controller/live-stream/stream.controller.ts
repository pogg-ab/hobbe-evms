import { Body, Controller, Get, HttpCode, Logger, OnModuleInit, Param, Patch, Post, UseGuards } from '@nestjs/common';
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
@Controller('streams')
@WebSocketGateway({
  namespace: '/stream',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
}) export class StreamController {
  private readonly logger = new Logger(StreamController.name);
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');

    this.server.on('connection', (socket: Socket) => {
      this.logger.log(`Client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        this.logger.log(`Client disconnected: ${socket.id}`);
      });
    });
  }


  @SubscribeMessage('joinStreamRoom')
  handleJoinRoom(
    @MessageBody() streamId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(streamId);
    this.logger.log(`Client ${client.id} joined stream room ${streamId}`);
    client.emit('joinedRoom', { success: true, streamId });
  }

  @SubscribeMessage('leaveStreamRoom')
  handleLeaveRoom(
    @MessageBody() streamId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(streamId);
    this.logger.log(`Client ${client.id} left stream room ${streamId}`);
    client.emit('leftRoom', { success: true, streamId });
  }

  @SubscribeMessage('streamControl')
  async handleStreamControl(
    @MessageBody() data: { streamId: string; action: string; payload?: any },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { streamId, action, payload } = data;
      this.logger.log(`Stream control request: ${action} for ${streamId}`);

      switch (action) {
        case 'start':
          await this.commandBus.execute(
            new StartScheduledStreamCommand(client.data.userId, streamId, payload),
          );
          break;
        case 'stop':
          await this.commandBus.execute(
            new EndStreamCommand(client.data.userId, streamId),
          );
          break;
        default:
          throw new Error('Invalid action');
      }

      this.server.to(streamId).emit('streamStatus', {
        streamId,
        status: action === 'start' ? 'live' : 'ended',
        timestamp: new Date().toISOString(),
      });

      return { success: true, action };
    } catch (error) {
      this.logger.error(`Stream control error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // @Post()
  // async createStream(@Body() createStreamDto: CreateStreamDto) {
  //   const { userId, eventId, startDate, endDate } = createStreamDto;

  //   return this.commandBus.execute(
  //     new CreateStreamCommand(userId, eventId, startDate, endDate),
  //   );
  // }

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

    return this.commandBus.execute(
      new ScheduleStreamCommand(
        userId,
        eventId,
        scheduledDate,
        scheduledTime,
        timezone
      ),
    );
  }

  @Post(':streamId/start-scheduled')
  @ApiOperation({
    summary: 'Start a scheduled stream',
    description: 'Transitions a scheduled stream to LIVE status and initiates broadcasting'
  })
  @ApiParam({
    name: 'streamId',
    description: 'ID of the scheduled stream to start',
    example: '9ea675ab-19bc-440d-808e-842efbbc467'
  })
  // @ApiBearerAuth('access-token')
  // @Roles('User')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  async startScheduledStream(
    // @CurrentUserId() user: any,
    @Param('streamId') streamId: string,
    @Body() startStreamDto?: StartStreamDto
  ): Promise<any> {
    // const userId = user.user.user_id.toString();
    const userId = "bdbcbb3a-0073-45c0-a94b-41b42f650345"
    const result = await this.commandBus.execute(
      new StartScheduledStreamCommand(userId, streamId, startStreamDto)
    );

    return result
  }

  @Post(':streamId/end-stream')
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

  // @Post('create-and-start')
  // async createAndStartStream(@Body() createAndStartStreamDto: CreateAndStartStreamDto) {
  //   const { userId, eventId, startDate, endDate, source } = createAndStartStreamDto;

  //   return this.commandBus.execute(
  //     new CreateAndStartStreamCommand(userId, eventId, startDate, endDate, source),
  //   );
  // }

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

  // @Get(':id')
  // async getStream(@Param('id') streamId: string) {
  //   return this.queryBus.execute(new GetStreamQuery(streamId));
  // }

  @Get()
  async getAllStreams() {
    return this.queryBus.execute(new GetAllStreamsQuery());
  }

  // @Post(':id/start')
  // async startStream(
  //   @Param('id') streamId: string,
  //   @Body() startStreamDto: StartStreamDto,
  // ) {
  //   const { source } = startStreamDto;

  //   try {
  //     const result = await this.commandBus.execute(new StartStreamCommand(streamId, source));

  //     return {
  //       success: true,
  //       message: `Stream ${streamId} started successfully`,
  //       data: result.data,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: `Failed to start stream: ${error.message}`,
  //       data: null,
  //     };
  //   }
  // }

  // @Post(':id/stop')
  // async stopStream(@Param('id') streamId: string) {
  //   const result = await this.commandBus.execute(
  //     new StopStreamCommand(streamId),
  //   );

  //   return result;
  // }

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

  // @Get('user/:userId')
  // async getStreamsByUserId(@Param('userId') userId: string) {
  //   return this.queryBus.execute(new GetStreamsByUserIdQuery(userId));
  // }
}