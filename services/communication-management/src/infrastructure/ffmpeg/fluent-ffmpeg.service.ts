import { Inject, Injectable, Logger } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import { STREAM_REPOSITORY_TOKEN } from 'src/domain/repositories/live-stream/stream.repository.token';
import { IStreamRepository } from 'src/domain/repositories/live-stream/stream.repository';
import * as os from 'os';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import { StartStreamDto } from 'src/presentation/dto/live-stream/start-stream.dto';
import { Server, WebSocket } from 'ws';

type StreamStatus = 'started' | 'stopped' | 'paused' | 'error';

interface FfmpegResponse {
  success: boolean;
  message: string;
  status: StreamStatus;
  data?: { streamId: string; rtmpUrl: string; wsPort: number };
}

@Injectable()
export class FluentFFmpegService {
  private activeProcesses: Map<string, any> = new Map();
  private pausedStreams: Map<string, { command: string; rtmpUrl: string }> = new Map();
  private webSocketServers: Map<string, Server> = new Map();
  private logger = new Logger(FluentFFmpegService.name);

  constructor(
    @Inject(STREAM_REPOSITORY_TOKEN)
    private readonly streamRepository: IStreamRepository,) {
    ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH || 'ffmpeg')

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
    config: StartStreamDto,
    rtmpUrl: string,
    streamId: string,
  ): Promise<FfmpegResponse> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.validateRtmpUrl(rtmpUrl)) {
          throw new Error('Valid RTMP URL is required (starting with rtmp://)');
        }

        const port = 9000 + Math.floor(Math.random() * 1000);
        const wsServer = new WebSocket.Server({ port });

        this.webSocketServers.set(streamId, wsServer);
        this.logger.log(`WebSocket server started on port ${port} for stream ${streamId}`);

        const { command } = this.buildFfmpegCommand(port, rtmpUrl, config);
        const ffmpegProcess = exec(command);

        ffmpegProcess.on('error', (error) => {
          this.logger.error(`FFmpeg error for stream ${streamId}: ${error.message}`);
          this.cleanupStream(streamId);
          reject({
            success: false,
            message: `FFmpeg error: ${error.message}`,
            status: 'error',
          });
        });

        ffmpegProcess.stdout?.on('data', (data) => {
          this.logger.debug(`FFmpeg stdout: ${data}`);
        });

        ffmpegProcess.stderr?.on('data', (data) => {
          this.logger.debug(`FFmpeg stderr: ${data}`);
        });

        ffmpegProcess.on('exit', (code) => {
          this.logger.log(`FFmpeg process exited with code ${code} for stream ${streamId}`);
          this.cleanupStream(streamId);
        });

        wsServer.on('connection', (ws: WebSocket) => {
          this.logger.log(`Client connected to stream ${streamId}`);

          ws.on('message', (data: Buffer) => {
            if (ffmpegProcess.stdin?.writable) {
              ffmpegProcess.stdin.write(data);
            }
          });

          ws.on('close', () => {
            this.logger.log(`Client disconnected from stream ${streamId}`);
          });

          ws.on('error', (error) => {
            this.logger.error(`WebSocket error for stream ${streamId}: ${error.message}`);
          });
        });

        this.activeProcesses.set(streamId, ffmpegProcess);

        resolve({
          success: true,
          message: 'WebSocket stream started successfully',
          status: 'started',
          data: { streamId, rtmpUrl, wsPort: port },
        });
      } catch (error) {
        this.logger.error(`Failed to start stream ${streamId}: ${error.message}`);
        reject({
          success: false,
          message: error.message,
          status: 'error',
        });
      }
    });
  }

  private buildFfmpegCommand(
    wsPort: number,
    rtmpUrl: string,
    config: StartStreamDto,
  ): { command: string } {
    const videoConfig = config.video;
    const audioConfig = config.audio;
    const useDocker = process.env.FFMPEG_DOCKER === 'true';
    const ffmpegPath = useDocker ? 'docker exec ffmpeg ffmpeg' : (process.env.FFMPEG_PATH || 'ffmpeg');

    const inputParams = [
      `-f mpegts`,
      `-listen 1`,
      `-i tcp://localhost:${wsPort}?listen`,
    ];

    const videoParams = [
      `-c:v libx264`,
      `-preset veryfast`,
      `-tune zerolatency`,
      `-b:v ${videoConfig.bitrate}k`,
      `-maxrate ${videoConfig.maxBitrate}k`,
      `-bufsize ${videoConfig.bufferSize}k`,
      `-g ${videoConfig.gop}`,
      `-keyint_min ${videoConfig.keyintMin}`,
      `-pix_fmt ${videoConfig.pixelFormat}`,
      `-x264-params keyint=${videoConfig.gop}:min-keyint=${videoConfig.keyintMin}`,
    ];

    const audioParams = audioConfig.enabled
      ? [
        `-c:a aac`,
        `-ar ${audioConfig.sampleRate}`,
        `-ac ${audioConfig.channels}`,
        `-b:a 128k`,
        `-aac_coder twoloop`,
      ]
      : ['-an'];

    const outputParams = [
      `-f flv`,
      `-flvflags no_duration_filesize`,
      `"${rtmpUrl}"`,
    ];

    const command = [
      ffmpegPath,
      ...inputParams,
      ...videoParams,
      ...audioParams,
      ...outputParams,
    ].join(' ');

    this.logger.debug(`Generated FFmpeg command: ${command}`);
    return { command };
  }

  async stopStream(streamId: string): Promise<FfmpegResponse> {
    return new Promise((resolve) => {
      try {
        const wsServer = this.webSocketServers.get(streamId);
        const ffmpegProcess = this.activeProcesses.get(streamId);

        if (!ffmpegProcess && !wsServer) {
          return resolve({
            success: false,
            message: 'No active stream found',
            status: 'error',
          });
        }

        if (wsServer) {
          wsServer.close();
          this.webSocketServers.delete(streamId);
          this.logger.log(`WebSocket server closed for stream ${streamId}`);
        }

        if (ffmpegProcess) {
          ffmpegProcess.kill('SIGINT');
          this.activeProcesses.delete(streamId);
          this.logger.log(`FFmpeg process stopped for stream ${streamId}`);
        }

        resolve({
          success: true,
          message: 'Stream stopped successfully',
          status: 'stopped',
        });
      } catch (error) {
        this.logger.error(`Error stopping stream ${streamId}: ${error.message}`);
        resolve({
          success: false,
          message: error.message,
          status: 'error',
        });
      }
    });
  }

  async pauseStream(streamId: string): Promise<FfmpegResponse> {
    return new Promise((resolve) => {
      try {
        const process = this.activeProcesses.get(streamId);
        if (!process) {
          return resolve({
            success: false,
            message: 'No active stream found',
            status: 'error'
          });
        }

        const command = process.spawnargs.join(' ');
        const rtmpUrl = this.extractRtmpUrl(command);

        this.pausedStreams.set(streamId, { command, rtmpUrl });
        process.kill('SIGINT');
        this.activeProcesses.delete(streamId);

        resolve({
          success: true,
          message: 'Stream paused successfully',
          status: 'paused'
        });
      } catch (error) {
        resolve({
          success: false,
          message: error.message,
          status: 'error'
        });
      }
    });
  }



  private async resumeStream(
    command: string,
    streamId: string,
    rtmpUrl: string
  ): Promise<FfmpegResponse> {
    return new Promise((resolve, reject) => {
      try {
        const ffmpegProcess = exec(command, (error) => {
          this.handleFfmpegError(error, streamId, reject);
        });

        this.activeProcesses.set(streamId, ffmpegProcess);
        this.pausedStreams.delete(streamId);

        ffmpegProcess.on('exit', (code) => {
          this.cleanupStream(streamId);
        });

        resolve({
          success: true,
          message: 'Stream resumed successfully',
          status: 'started',
          data: { streamId, rtmpUrl, wsPort: 9000 },
        });
      } catch (error) {
        reject({
          success: false,
          message: error.message,
          status: 'error'
        });
      }
    });
  }

  private validateRtmpUrl(url: string): boolean {
    return url.startsWith('rtmp://');
  }

  private isMobilePlatform(): boolean {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent;
    return /iPhone|iPad|iPod|Android/i.test(ua);
  }

  private isAndroid(): boolean {
    if (typeof window === 'undefined') return false;
    return /Android/i.test(window.navigator.userAgent);
  }

  private isIOS(): boolean {
    if (typeof window === 'undefined') return false;
    return /iPhone|iPad|iPod/i.test(window.navigator.userAgent);
  }

  private extractRtmpUrl(command: string): string {
    const match = command.match(/rtmp:\/\/[^\s"]+/);
    return match ? match[0] : '';
  }

  private handleFfmpegError(error: Error, streamId: string, reject: (reason: any) => void): void {
    this.activeProcesses.delete(streamId);

    let userMessage = 'Streaming error';
    if (error.message.includes('dshow')) {
      userMessage = 'Windows camera error - try lower resolution or different format';
    } else if (error.message.includes('v4l2')) {
      userMessage = 'Linux camera error - check supported formats';
    } else if (error.message.includes('Output')) {
      userMessage = 'Stream output error - check RTMP URL';
    } else if (this.isAndroid()) {
      userMessage = 'Android camera error - check permissions';
    } else if (this.isIOS()) {
      userMessage = 'iOS camera error - check permissions';
    }

    reject({
      success: false,
      message: userMessage,
      status: 'error'
    });
  }

  private cleanupStream(streamId: string): void {
    this.activeProcesses.delete(streamId);
    this.pausedStreams.delete(streamId);
  }

  private async selectDefaultCamera(platform: string): Promise<string> {
    switch (platform) {
      case 'win32': return '720p HD Camera';
      case 'darwin': return '0';
      case 'linux': return '/dev/video0';
      default: throw new Error('Cannot select default camera for unknown platform');
    }
  }




}