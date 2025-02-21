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
  ): Promise<Stream> {
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

      const createdStream = await this.streamRepository.create(stream);
      console.log(`Stream created with ID: ${streamID.toString()}`);

      stream.status = 'active';

      if (stream.status === 'active') {
        const rtmpUrl = `${process.env.RTMP_URL}/${streamKey}`;
        await this.startStreamFromFile('./media/sample.mp4', rtmpUrl);
      }

      return createdStream;
    } catch (error) {
      console.error(`Failed to create stream: ${error.message}`);
      throw error;
    }
  }

  async updateStream(
    streamId: string,
    url: string,
    status: 'inactive' | 'active' | 'completed',
  ): Promise<Stream> {
    const stream = await this.streamRepository.findById(new StreamID(streamId));
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
    const stream = await this.streamRepository.findById(new StreamID(streamId));
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
  ): Promise<void> {
    try {
      console.log(`Starting stream from file: ${inputFilePath} to ${rtmpUrl}`);

      if (!fs.existsSync(inputFilePath)) {
        throw new Error(`File not found: ${inputFilePath}`);
      }

      await this.fluentFFmpegService.streamFileToRtmp(inputFilePath, rtmpUrl);

      console.log(`Stream started successfully from file: ${inputFilePath}`);
    } catch (error) {
      console.error(`Failed to start stream from file: ${error.message}`);
      throw error;
    }
  }
}
