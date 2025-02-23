import { Inject, Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import { STREAM_REPOSITORY_TOKEN } from 'src/domain/repositories/live-stream/stream.repository.token';
import { IStreamRepository } from 'src/domain/repositories/live-stream/stream.repository';
import * as os from 'os';

@Injectable()
export class FluentFFmpegService {
  private activeProcesses: Map<string, ffmpeg.FfmpegCommand> = new Map();

  constructor(
    @Inject(STREAM_REPOSITORY_TOKEN)
    private readonly streamRepository: IStreamRepository,) {
    ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH || 'ffmpeg')

  }
  async transcodeStream(
    inputStream: string | fs.ReadStream,
    outputStream: string | NodeJS.WritableStream,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputStream)
        .output(outputStream)
        .on('start', (commandLine) => {
          console.log(`FFmpeg process started with command: ${commandLine}`);
        })
        .on('end', () => {
          console.log('FFmpeg process finished.');
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        });

      command.run();
    });
  }

  async streamFileToRtmp(
    inputFilePath: string,
    rtmpUrl: string,
    streamId: string,
  ): Promise<{ success: boolean; message: string; status: 'started' | 'stopped' | 'error' | 'else'; data?: { streamId: string; rtmpUrl: string } }> {
    return new Promise((resolve, reject) => {
      console.log(`Starting stream from file: ${inputFilePath} to RTMP URL: ${rtmpUrl} for stream ID: ${streamId}`);

      if (!inputFilePath || !rtmpUrl) {
        const errorMessage = `Invalid input file path or RTMP URL: filePath=${inputFilePath}, rtmpUrl=${rtmpUrl}`;
        console.error(errorMessage);
        reject({ success: false, message: errorMessage, status: 'error' });
        return;
      }

      const command = ffmpeg(inputFilePath)
        .inputOptions('-re')
        .output(rtmpUrl)
        .outputOptions([
          '-c:v libx264',
          '-preset veryfast',
          '-maxrate 800k',
          '-bufsize 1600k',
          '-vf scale=640:360',
          '-c:a aac',
          '-b:a 128k',
          '-f flv',
        ])
        .on('start', async () => {
          console.log(`Stream started for stream ID: ${streamId}`);
          this.activeProcesses.set(streamId, command);

          resolve({
            success: true,
            message: `Stream started successfully for stream ID: ${streamId}`,
            status: 'started',
            data: { streamId, rtmpUrl },
          });
        })
        .on('end', async () => {
          console.log(`Streaming finished for stream ID: ${streamId}`);

          try {
            await this.stopStream(streamId);
            resolve({
              success: true,
              message: `Stream ended successfully for stream ID: ${streamId}`,
              status: 'stopped',
              data: { streamId, rtmpUrl },
            });
          } catch (error) {
            console.error(`Failed to stop stream ${streamId} after FFmpeg ended: ${error.message}`);
            reject({ success: false, message: `Failed to stop stream: ${error.message}`, status: 'error' });
          }
        })
        .on('error', (err) => {
          console.error(`FFmpeg error for stream ID: ${streamId}: ${err.message}`);
          this.activeProcesses.delete(streamId);
          reject({ success: false, message: `FFmpeg error: ${err.message}`, status: 'error' });
        })
        .on('stderr', (stderrLine) => {
          console.log(`FFmpeg stderr for stream ID: ${streamId}: ${stderrLine}`);
        });

      command.run();
    });
  }

  async streamCameraToRtmp(
    cameraDevice: string,
    rtmpUrl: string,
    streamId: string,
  ): Promise<{ success: boolean; message: string; status: 'started' | 'stopped' | 'error' | 'else'; data?: { streamId: string; rtmpUrl: string } }> {
    return new Promise((resolve, reject) => {
      console.log(`Starting stream from camera: ${cameraDevice} to RTMP URL: ${rtmpUrl} for stream ID: ${streamId}`);

      if (!cameraDevice || !rtmpUrl) {
        const errorMessage = `Invalid camera device or RTMP URL: device=${cameraDevice}, rtmpUrl=${rtmpUrl}`;
        console.error(errorMessage);
        reject({ success: false, message: errorMessage, status: 'error' });
        return;
      }

      let inputFormat: string;
      if (os.platform() === 'win32') {
        inputFormat = 'dshow'; // Windows
      } else if (os.platform() === 'darwin') {
        inputFormat = 'avfoundation'; // macOS
      } else if (os.platform() === 'linux') {
        inputFormat = 'v4l2'; // Linux
      } else {
        const errorMessage = `Unsupported OS: ${os.platform()}`;
        console.error(errorMessage);
        reject({ success: false, message: errorMessage, status: 'error' });
        return;
      }

      const command = ffmpeg()
        .input(cameraDevice)
        .inputOptions('-f', inputFormat)
        .output(rtmpUrl)
        .outputOptions([
          '-c:v libx264',
          '-preset veryfast',
          '-maxrate 800k',
          '-bufsize 1600k',
          '-vf scale=640:360',
          '-c:a aac',
          '-b:a 128k',
          '-f flv',
        ])
        .on('start', async () => {
          console.log(`Stream started for stream ID: ${streamId}`);
          this.activeProcesses.set(streamId, command);

          resolve({
            success: true,
            message: `Stream started successfully for stream ID: ${streamId}`,
            status: 'started',
            data: { streamId, rtmpUrl },
          });
        })
        .on('end', async () => {
          console.log(`Streaming finished for stream ID: ${streamId}`);

          try {
            await this.stopStream(streamId);
            resolve({
              success: true,
              message: `Stream ended successfully for stream ID: ${streamId}`,
              status: 'stopped',
              data: { streamId, rtmpUrl },
            });
          } catch (error) {
            console.error(`Failed to stop stream ${streamId} after FFmpeg ended: ${error.message}`);
            reject({ success: false, message: `Failed to stop stream: ${error.message}`, status: 'error' });
          }
        })
        .on('error', (err) => {
          console.error(`FFmpeg error for stream ID: ${streamId}: ${err.message}`);
          this.activeProcesses.delete(streamId);
          reject({ success: false, message: `FFmpeg error: ${err.message}`, status: 'error' });
        })
        .on('stderr', (stderrLine) => {
          console.log(`FFmpeg stderr for stream ID: ${streamId}: ${stderrLine}`);
        });

      command.run();
    });
  }

  async stopStream(streamId: string): Promise<{ success: boolean; message: string; status: 'stopped' | 'error' | 'else' }> {
    const process = this.activeProcesses.get(streamId);

    if (process) {
      try {
        process.kill('SIGTERM');
        this.activeProcesses.delete(streamId);
        const stream = await this.streamRepository.findById(streamId);
        if (!stream) {
          throw new Error(`Stream with ID ${streamId} not found`);
        }

        if (stream.status !== 'active') {
          throw new Error(`Stream with ID ${streamId} is not active`);
        }


        stream.status = 'completed';
        stream.endDate = new Date();
        stream.updatedAt = new Date();
        await this.streamRepository.update(stream);


        console.log(`Stream ${streamId} completed successfully`);
        return {
          success: true,
          message: `Stream ${streamId} completed successfully`,
          status: 'stopped',
        };
      } catch (error) {
        console.error(`Failed to stop stream ${streamId}: ${error.message}`);
        return {
          success: false,
          message: `Failed to stop stream ${streamId}: ${error.message}`,
          status: 'error',
        };
      }
    } else {
      console.warn(`No active stream found for ID ${streamId}`);
      return {
        success: false,
        message: `No active stream found for ID ${streamId}`,
        status: 'else',
      };
    }
  }

}