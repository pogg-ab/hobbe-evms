import { Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { Stream } from 'src/domain/entities/stream.entity';
import { IStreamRepository } from 'src/domain/repositories/live-stream/stream.repository';
import { STREAM_REPOSITORY_TOKEN } from 'src/domain/repositories/live-stream/stream.repository.token';
import { StreamID } from 'src/domain/value-objects/stream-id.value-object';
import { FluentFFmpegService } from 'src/infrastructure/ffmpeg/fluent-ffmpeg.service';
import { NodeMediaService } from 'src/infrastructure/media-server/media-server.service';

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
      stream.updatedAt = new Date();
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
      if (startDate) {
        stream.startDate = new Date(startDate);
      }
      if (endDate) {
        stream.endDate = new Date(endDate);
      }
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

  async startStream(streamId: string, filePath: string): Promise<{ success: boolean; message: string; data: Stream | null }> {
    try {
      const stream = await this.streamRepository.findById(streamId);
      if (!stream) {
        throw new Error(`Stream with ID ${streamId.toString()} not found`);
      }

      if (stream.status === 'active') {
        throw new Error(`Stream with ID ${streamId.toString()} is already active`);
      }

      stream.status = 'active';
      stream.startDate = new Date();
      stream.updatedAt = new Date();
      await this.streamRepository.update(stream);

      const rtmpUrl = stream.url;
      await this.startStreamFromFile(filePath, rtmpUrl, streamId);
      this.nodeMediaService.startStream(rtmpUrl, streamId);

      return {
        success: true,
        message: `Stream ${streamId} started successfully`,
        data: stream,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to start stream ${streamId}: ${error.message}`,
        data: null,
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
      stream.endDate = new Date();
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

  async transcodeStream(
    inputStream: string | fs.ReadStream,
    outputStream: string | NodeJS.WritableStream,
  ): Promise<void> {
    try {
      await this.fluentFFmpegService.transcodeStream(inputStream, outputStream);
    } catch (error) {
      console.error('Error during stream transcoding:', error);
    }
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

}
