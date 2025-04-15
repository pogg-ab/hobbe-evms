import { Inject, Injectable, Logger } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import { STREAM_REPOSITORY_TOKEN } from 'src/domain/repositories/live-stream/stream.repository.token';
import { IStreamRepository } from 'src/domain/repositories/live-stream/stream.repository';
import * as os from 'os';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import { StartStreamDto } from 'src/presentation/dto/live-stream/start-stream.dto';

type StreamStatus = 'started' | 'stopped' | 'paused' | 'error';

interface FfmpegResponse {
  success: boolean;
  message: string;
  status: StreamStatus;
  data?: { streamId: string; rtmpUrl: string };
}

@Injectable()
export class FluentFFmpegService {
  private activeProcesses: Map<string, any> = new Map();
  private pausedStreams: Map<string, { command: string; rtmpUrl: string }> = new Map();


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
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.validateRtmpUrl(rtmpUrl)) {
          return reject({
            success: false,
            message: 'Valid RTMP URL is required (starting with rtmp://)',
            status: 'error'
          });
        }

        if (this.pausedStreams.has(streamId) && !config.video.enabled) {
          const paused = this.pausedStreams.get(streamId);
          return this.resumeStream(paused.command, streamId, paused.rtmpUrl)
            .then(resolve)
            .catch(reject);
        }

        const { command } = await this.buildFfmpegCommand(
          rtmpUrl,
          streamId,
          config
        );

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
          message: 'Stream started successfully',
          status: 'started',
          data: { streamId, rtmpUrl },
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

  async stopStream(streamId: string): Promise<FfmpegResponse> {
    return new Promise((resolve) => {
      try {
        const process = this.activeProcesses.get(streamId);
        if (process) {
          process.kill('SIGINT');
          resolve({
            success: true,
            message: 'Stream stopped successfully',
            status: 'stopped'
          });
        } else {
          resolve({
            success: false,
            message: 'No active stream found',
            status: 'error'
          });
        }
      } catch (error) {
        resolve({
          success: false,
          message: error.message,
          status: 'error'
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

  private async buildFfmpegCommand(
    rtmpUrl: string,
    streamId: string,
    config: StartStreamDto): Promise<{ command: string; selectedCamera: string }> {
    const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
    const platform = os.platform();
    const isMobile = this.isMobilePlatform();

    const videoEnabled = config.video.enabled
    let selectedCamera = videoEnabled ? await this.selectDefaultCamera(platform) : 'none';

    const commonParams = `-pix_fmt yuv420p -c:v libx264 -preset veryfast -tune zerolatency ` +
      `-b:v 2000k -maxrate 2000k -bufsize 4000k -g 60 -keyint_min 60 ` +
      `-threads 2 -movflags +faststart -f flv "${rtmpUrl}"`;

    let inputParams: string;

    if (!videoEnabled) {
      inputParams = `-f lavfi -i color=c=black:s=1280x720:r=30`;
    } else if (isMobile && this.isAndroid()) {
      inputParams = `-f android_camera -camera_index ${selectedCamera} -video_size 1280x720 -framerate 30`;
    } else if (isMobile && this.isIOS()) {
      inputParams = `-f avfoundation -video_size 1280x720 -framerate 30 -i "${selectedCamera}"`;
    } else {
      selectedCamera = selectedCamera.replace(/^video=/, '').trim();
      switch (platform) {
        case 'win32':
          inputParams = `-f dshow -video_size 1280x720 -framerate 30 -rtbufsize 2000000 -i video="${selectedCamera}"`;
          break;
        case 'darwin':
          inputParams = `-f avfoundation -video_size 1280x720 -framerate 30 -i "${selectedCamera}"`;
          break;
        case 'linux':
          inputParams = `-f v4l2 -video_size 1280x720 -framerate 30 -input_format mjpeg -i "${selectedCamera}"`;
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    }

    return {
      command: `${ffmpegPath} ${inputParams} ${commonParams}`,
      selectedCamera: videoEnabled ? selectedCamera : 'none'
    };
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
          data: { streamId, rtmpUrl },
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