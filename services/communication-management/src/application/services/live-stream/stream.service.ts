import { Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { Stream } from 'src/domain/entities/stream.entity';
import { IStreamRepository } from 'src/domain/repositories/live-stream/stream.repository';
import { STREAM_REPOSITORY_TOKEN } from 'src/domain/repositories/live-stream/stream.repository.token';
import { StreamID } from 'src/domain/value-objects/stream-id.value-object';
import { FluentFFmpegService } from 'src/infrastructure/ffmpeg/fluent-ffmpeg.service';
import { NodeMediaService } from 'src/infrastructure/media-server/media-server.service';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { StartStreamDto } from 'src/presentation/dto/live-stream/start-stream.dto';
import { StreamOptions } from 'stream';
type StreamStatus = 'started' | 'stopped' | 'paused' | 'error';

interface FfmpegResponse {
  success: boolean;
  message: string;
  status: StreamStatus;
  data?: { streamId: string; rtmpUrl: string; wsPort: number };
}
@Injectable()
export class StreamService {
  constructor(
    @Inject(STREAM_REPOSITORY_TOKEN)
    private readonly streamRepository: IStreamRepository,
    private readonly nodeMediaService: NodeMediaService,
    private readonly fluentFFmpegService: FluentFFmpegService,
  ) { }

  async createStream(
    streamID: StreamID,
    userId: string,
    eventId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{ success: boolean; message: string; data: Stream }> {
    try {
      const stream = new Stream();

      stream.status = 'inactive';
      stream.userId = userId;
      stream.eventId = eventId;
      stream.createdBy = userId;
      stream.createdAt = new Date();

      const now = new Date();
      const dateString = now
        .toISOString()
        .replace(/[-:T]/g, '')
        .split('.')[0];
      const streamKey = `${userId}-${dateString}`;

      stream.url = `${process.env.RTMP_URL}/${streamKey}`;
      stream.streamKey = streamKey;
      stream.hlsOutputPath = `${process.env.HLS_OUTPUT_BASE_PATH}/${streamKey}`;
      const createdStream = await this.streamRepository.create(stream);

      return {
        success: true,
        message: 'Stream created successfully',
        data: createdStream,
      };
    } catch (error) {
      console.error(`Failed to create stream: ${error.message}`);
      throw error;
    }
  }

  async scheduleStream(
    userId: string,
    eventId: string,
  ): Promise<{ success: boolean; message: string; data: Stream }> {
    try {

      const stream = new Stream();
      stream.status = 'inactive';
      stream.userId = userId;
      stream.eventId = eventId;
      stream.createdBy = userId;
      const dateString = new Date()
        .toISOString()
        .replace(/[-:T]/g, '')
        .split('.')[0];
      const streamKey = `${userId}-${dateString}`;
      stream.url = `${process.env.RTMP_URL}/${streamKey}`;
      stream.hlsOutputPath = `${process.env.HLS_OUTPUT_BASE_PATH}/${streamKey}`;
      stream.streamKey = streamKey;

      const createdStream = await this.streamRepository.create(stream);

      return {
        success: true,
        message: 'Stream scheduled successfully',
        data: createdStream,
      };
    } catch (error) {
      console.error(`Failed to schedule stream: ${error.message}`);
      throw error;
    }
  }


  async startScheduledStream(
    userId: string,
    streamId: string,
    startStreamDto: StartStreamDto
  ): Promise<{ success: boolean; message: string; streamId?: string }> {
    const logger = new Logger('StreamService');

    try {
      const stream = await this.streamRepository.findById(streamId);
      if (!stream) {
        throw new NotFoundException({
          success: false,
          message: 'Stream not found',
          streamId
        });
      }

      if (stream.userId !== userId) {
        throw new ForbiddenException({
          success: false,
          message: 'Unauthorized to start this stream',
          streamId
        });
      }

      if (stream.status !== 'inactive') {
        throw new ConflictException({
          success: false,
          message: `Stream cannot be started from current status: ${stream.status}`,
          currentStatus: stream.status,
          requiredStatus: 'inactive'
        });
      }

      const now = new Date();
      // if (stream.startDate && now < new Date(stream.startDate)) {
      //   throw new BadRequestException({
      //     success: false,
      //     message: 'Stream cannot start before scheduled time',
      //     scheduledTime: stream.startDate,
      //     currentTime: now.toISOString()
      //   });
      // }

      const result = await this.startStream(streamId, startStreamDto);

      return result;

    } catch (error) {
      logger.error(`Stream activation failed`, {
        error: error.message,
        userId,
        streamId,
        stack: error.stack
      });

      if (error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to start stream due to technical error',
        streamId,
        errorCode: 'STREAM_ACTIVATION_FAILED'
      });
    }
  }


  async endStream(
    streamId: string,
    userId: string
  ): Promise<{ success: boolean; message: string; data: Stream | null }> {
    const logger = new Logger('StreamService');

    try {
      const stream = await this.streamRepository.findById(streamId);
      if (!stream) {
        throw new NotFoundException({
          success: false,
          message: 'Stream not found',
          streamId
        });
      }

      if (stream.userId !== userId) {
        throw new ForbiddenException({
          success: false,
          message: 'Unauthorized to end this stream',
          streamId
        });
      }

      if (stream.status !== 'active') {
        throw new ConflictException({
          success: false,
          message: `Stream cannot be ended from current status: ${stream.status}`,
          currentStatus: stream.status,
          requiredStatus: 'active'
        });
      }

      this.fluentFFmpegService.stopStream(streamId);

      this.nodeMediaService.stopStream(streamId);

      stream.status = 'completed';
      // stream.endDate = new Date();
      stream.updatedAt = new Date();
      const updatedStream = await this.streamRepository.update(stream);

      logger.log(`Stream ${streamId} ended successfully by user ${userId}`);

      return {
        success: true,
        message: `Stream ${streamId} ended successfully`,
        data: updatedStream,
      };
    } catch (error) {
      logger.error(`Failed to end stream ${streamId}`, {
        error: error.message,
        userId,
        streamId,
        stack: error.stack
      });

      if (error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to end stream due to technical error',
        streamId,
        errorCode: 'STREAM_END_FAILED'
      });
    }
  }


  // private async scheduleStreamStart(streamId: string, scheduledTime: Date): Promise<void> {
  //   const now = new Date();
  //   const delay = scheduledTime.getTime() - now.getTime();

  //   if (delay > 0) {
  //     setTimeout(async () => {
  //       try {
  //         await this.startStream(streamId, { cameraDevice: 'default' });
  //       } catch (error) {
  //         console.error(`Failed to auto-start scheduled stream ${streamId}: ${error.message}`);
  //       }
  //     }, delay);
  //   } else {
  //     throw new Error('Scheduled time must be in the future');
  //   }
  // }

  async startStream(streamId: string, config: StartStreamDto): Promise<{ success: boolean; message: string; data: Stream | null, port: any }> {
    try {
      const stream = await this.streamRepository.findById(streamId);
      if (!stream) {
        throw new Error(`Stream with ID ${streamId.toString()} not found`);
      }

      if (stream.status === 'active') {
        throw new Error(`Stream with ID ${streamId.toString()} is already active`);
      }

      stream.status = 'active';
      // stream.startDate = new Date();
      stream.updatedAt = new Date();
      await this.streamRepository.update(stream);

      const rtmpUrl = stream.url;

      const streamingOptions = {
        source: config.source,
        video: config.video,
        audio: config.audio,
        hardwareAcceleration: config.hardwareAcceleration
      };
      let result = null
      switch (config.source.type) {
        case 'file':
          await this.startStreamFromFile(stream.url, streamId, streamingOptions.source.filePath);
          break;
        case 'camera':
          result = await this.startStreamFromCamera(stream.url, stream.hlsOutputPath, streamId, streamingOptions);
          break;
        default:
          throw new Error(`Unsupported source type: ${config.source.type}`);
      }


      this.nodeMediaService.startStream(rtmpUrl, streamId);

      return {
        success: true,
        message: `Stream ${streamId} started successfully`,
        data: stream,
        port: result.data.wsPort
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to start stream ${streamId}: ${error.message}`,
        data: null,
        port: null
      };
    }
  }


  async stopStream(
    streamId: string,
  ): Promise<{ success: boolean; message: string; data: Stream | null }> {
    try {
      const stream = await this.streamRepository.findById(streamId);
      if (!stream) {
        throw new Error(`Stream with ID ${streamId} not found`);
      }

      if (stream.status !== 'active') {
        throw new Error(`Stream with ID ${streamId} is not active`);
      }

      this.fluentFFmpegService.stopStream(streamId);
      this.nodeMediaService.stopStream(streamId);

      stream.status = 'completed';
      // stream.endDate = new Date();
      stream.updatedAt = new Date();
      await this.streamRepository.update(stream);


      console.log(`Stream ${streamId} completed successfully`);

      return {
        success: true,
        message: `Stream ${streamId} stopped successfully`,
        data: stream,
      };
    } catch (error) {
      console.error(`Failed to stop stream ${streamId}: ${error.message}`);

      return {
        success: false,
        message: `Failed to stop stream ${streamId}: ${error.message}`,
        data: null,
      };
    }
  }

  async findByUserId(userId: string): Promise<Stream[]> {
    try {
      const streams = await this.streamRepository.findByUserId(userId);
      return streams;
    } catch (error) {
      console.error(`Failed to fetch streams for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  async updateStream(
    streamId: string,
    url: string,
    status: 'inactive' | 'active' | 'completed',
  ): Promise<Stream> {
    const stream = await this.streamRepository.findById(streamId);
    if (!stream) throw new Error('Stream not found');
    stream.url = url;
    stream.status = status;
    const updatedStream = await this.streamRepository.update(stream);
    if (status === 'active') {
      await this.nodeMediaService.startStream(stream.url, streamId);
    } else if (status === 'completed') {
      await this.nodeMediaService.stopStream(streamId);
    }
    return updatedStream;
  }

  async getStreamById(streamId: string): Promise<Stream> {
    const stream = await this.streamRepository.findById(streamId);
    if (!stream) throw new Error('Stream not found');
    return stream;
  }

  async getAllStreams(): Promise<Stream[]> {
    return this.streamRepository.findAll();
  }
  async getStreamByStatus(status: string): Promise<Stream[]> {
    return this.streamRepository.findByStatus(status);
  }

  async startStreamFromFile(
    inputFilePath: string,
    rtmpUrl: string,
    streamId: string
  ): Promise<{ success: boolean; message: string; data?: { streamId: string; rtmpUrl: string } }> {
    try {
      console.log(`Starting stream from file: ${inputFilePath} to ${rtmpUrl} for stream ID: ${streamId}`);

      if (!fs.existsSync(inputFilePath)) {
        const errorMessage = `File not found: ${inputFilePath}`;
        console.error(errorMessage);
        return {
          success: false,
          message: errorMessage,
        };
      }

      const streamStatus = await this.fluentFFmpegService.streamFileToRtmp(inputFilePath, rtmpUrl, streamId);
      if (streamStatus.status === 'stopped') {
        console.log(`Stream ID: ${streamId} is stopped, stopping any active stream before starting.`);
        await this.stopStream(streamId);
      }

      console.log(`Stream started successfully from file: ${inputFilePath} for stream ID: ${streamId}`);
      return {
        success: true,
        message: `Stream started successfully for stream ID: ${streamId}`,
        data: { streamId, rtmpUrl },
      };
    } catch (error) {
      console.error(`Failed to start stream from file: ${inputFilePath} for stream ID: ${streamId}: ${error.message}`);
      return {
        success: false,
        message: `Failed to start stream: ${error.message}`,
      };
    }
  }

  async startStreamFromCamera(rtmpUrl: string, hlsOutputPath: string, streamId: string, config: StartStreamDto): Promise<FfmpegResponse> {
    try {
      console.log(`Starting stream to RTMP URL: ${rtmpUrl} for stream ID: ${streamId}`);

      const stream = await this.streamRepository.findById(streamId);
      const streamStatus = await this.fluentFFmpegService.streamCameraToRtmp(config, rtmpUrl, hlsOutputPath, streamId);
      if (streamStatus.status === 'started') {
        console.log(`Stream started successfully for stream ID: ${streamId}`);
        return streamStatus;
      } else {
        console.error(`Failed to start stream for stream ID: ${streamId}`);
        return streamStatus;
      }
    } catch (error) {
      console.error(`Failed to start stream from camera for stream ID: ${streamId}: ${error.message}`);
      return {
        success: false,
        message: `Failed to start stream: ${error.message}`,
        status: "error"
      };
    }
  }

  async getCameraDevices(): Promise<{ deviceId: string; label: string }[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log("devices : ", devices)
      return devices.filter(device => device.kind === 'videoinput').map(device => ({
        deviceId: device.deviceId,
        label: device.label || 'Unknown Camera',
      }));
    } catch (error) {
      console.error('Error getting camera devices:', error);
      return [];
    }
  }

}
