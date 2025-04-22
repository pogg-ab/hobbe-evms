import { Inject, Injectable, Logger } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import { STREAM_REPOSITORY_TOKEN } from 'src/domain/repositories/live-stream/stream.repository.token';
import { IStreamRepository } from 'src/domain/repositories/live-stream/stream.repository';
import * as os from 'os';
import { existsSync } from 'fs';
import { ChildProcess, exec } from 'child_process';
import { StartStreamDto } from 'src/presentation/dto/live-stream/start-stream.dto';
import { Server, WebSocket } from 'ws';
import { WebSocketServer } from 'ws';
import * as net from 'net';
import * as path from 'path';


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
    hlsOutputPath: string,
    streamId: string,
  ): Promise<FfmpegResponse> {
    return new Promise((resolve, reject) => {
      // Track initialization time
      const streamStartTime = Date.now();
      let ffmpegStartTimeout: NodeJS.Timeout;

      try {
        if (!this.validateRtmpUrl(rtmpUrl)) {
          throw new Error('Valid RTMP URL is required (starting with rtmp://)');
        }

        const port = 9000 + Math.floor(Math.random() * 1000);
        const wsServer = new WebSocketServer({ port });
        const tcpProxyServer = net.createServer();

        this.webSocketServers.set(streamId, wsServer);
        this.logger.log(`[${streamId}] WebSocket server started on port ${port}`);

        let ffmpegProcess: ChildProcess;
        let isFfmpegReady = false;
        const pendingData: Buffer[] = [];

        // Enhanced statistics
        const stats = {
          bytesReceived: 0,
          bytesForwarded: 0,
          lastPacketTime: 0,
          packetsReceived: 0,
          packetsForwarded: 0,
          ffmpegStartTime: 0,
          bufferingStartTime: Date.now()
        };

        tcpProxyServer.listen(port + 1, () => {
          this.logger.log(`[${streamId}] TCP proxy server started on port ${port + 1}`);

          const { command } = this.buildFfmpegCommand(port + 1, rtmpUrl, hlsOutputPath, config);
          this.logger.debug(`[${streamId}] FFmpeg command: ${command}`);
          ffmpegProcess = exec(command);
          stats.ffmpegStartTime = Date.now();
          this.activeProcesses.set(streamId, ffmpegProcess);

          // FFmpeg initialization timeout (15 seconds)
          ffmpegStartTimeout = setTimeout(() => {
            if (!isFfmpegReady) {
              this.logger.error(`[${streamId}] FFmpeg initialization timeout (15s)`);
              this.cleanupStream(streamId);
              reject({
                success: false,
                message: 'FFmpeg initialization timeout',
                status: 'error',
                stats,
                initializationTime: Date.now() - streamStartTime
              });
            }
          }, 15000);

          // FFmpeg process handlers
          ffmpegProcess.on('error', (error) => {
            clearTimeout(ffmpegStartTimeout);
            this.logger.error(`[${streamId}] FFmpeg error: ${error.message}`);
            this.cleanupStream(streamId);
            reject({
              success: false,
              message: `FFmpeg error: ${error.message}`,
              status: 'error',
              stats,
              initializationTime: Date.now() - streamStartTime
            });
          });

          ffmpegProcess.stdout?.on('data', (data) => {
            this.logger.debug(`[${streamId}] FFmpeg stdout: ${data.toString().trim()}`);
          });

          ffmpegProcess.stderr?.on('data', (data) => {
            const output = data.toString().trim();
            this.logger.debug(`[${streamId}] FFmpeg stderr: ${output}`);

            // Check for FFmpeg ready signal
            if (output.includes('Listening on')) {
              clearTimeout(ffmpegStartTimeout);
              isFfmpegReady = true;
              const initTime = Date.now() - stats.ffmpegStartTime;
              this.logger.log(`[${streamId}] FFmpeg ready in ${initTime}ms`);

              // Process pending data
              if (pendingData.length > 0) {
                const totalBytes = pendingData.reduce((sum, chunk) => sum + chunk.length, 0);
                this.logger.log(`[${streamId}] Flushing ${pendingData.length} buffered chunks (${totalBytes} bytes)`);

                pendingData.forEach(chunk => {
                  stats.bytesForwarded += chunk.length;
                  stats.packetsForwarded++;
                  tcpProxyServer?.emit('data', chunk);
                });
                pendingData.length = 0;
              }
            }
          });

          ffmpegProcess.on('exit', (code, signal) => {
            clearTimeout(ffmpegStartTimeout);
            const runtime = Date.now() - stats.ffmpegStartTime;
            this.logger.log(`[${streamId}] FFmpeg exited after ${runtime}ms | Code: ${code} | Signal: ${signal}`);
            this.logger.log(`[${streamId}] Final stats: ` +
              `Received: ${stats.packetsReceived} packets (${this.formatBytes(stats.bytesReceived)}) | ` +
              `Forwarded: ${stats.packetsForwarded} packets (${this.formatBytes(stats.bytesForwarded)})`);
            this.cleanupStream(streamId);
          });
        });

        // TCP proxy handlers
        tcpProxyServer.on('connection', (tcpSocket) => {
          this.logger.log(`[${streamId}] FFmpeg connected to TCP proxy`);

          tcpSocket.on('error', (error) => {
            this.logger.error(`[${streamId}] TCP error: ${error.message}`);
          });

          tcpSocket.on('close', () => {
            this.logger.log(`[${streamId}] FFmpeg disconnected from TCP proxy`);
          });
        });

        // WebSocket connection handler
        wsServer.on('connection', (ws) => {
          this.logger.log(`[${streamId}] New WebSocket connection`);
          let tcpSocket: net.Socket;

          const clientStats = {
            bytesReceived: 0,
            packetsReceived: 0,
            lastActivity: Date.now(),
            connectedAt: Date.now()
          };

          const connectToFfmpeg = () => {
            tcpSocket = net.connect({ port: port + 1 }, () => {
              this.logger.log(`[${streamId}] TCP proxy connected`);
            });

            // Data forwarding
            ws.on('message', (data: Buffer) => {
              try {
                const now = Date.now();
                clientStats.lastActivity = now;
                stats.lastPacketTime = now;

                clientStats.packetsReceived++;
                stats.packetsReceived++;

                const chunkSize = data.length;
                clientStats.bytesReceived += chunkSize;
                stats.bytesReceived += chunkSize;

                if (!isFfmpegReady) {
                  pendingData.push(data);
                  // this.logger.debug(`[${streamId}] Buffering chunk (${this.formatBytes(chunkSize)})`);
                  return;
                }

                if (tcpSocket.writable) {
                  tcpSocket.write(data, (error) => {
                    if (error) {
                      this.logger.error(`[${streamId}] TCP write error: ${error.message}`);
                    } else {
                      stats.packetsForwarded++;
                      stats.bytesForwarded += chunkSize;
                    }
                  });
                } else {
                  this.logger.warn(`[${streamId}] TCP socket not writable - buffering chunk`);
                  pendingData.push(data);
                }
              } catch (error) {
                this.logger.error(`[${streamId}] Message handling error: ${error.message}`);
              }
            });

            tcpSocket.on('error', (error) => {
              this.logger.error(`[${streamId}] TCP proxy error: ${error.message}`);
              ws.close();
            });
          };

          // Connect with slight delay
          setTimeout(connectToFfmpeg, 500);

          ws.on('close', () => {
            const duration = Date.now() - clientStats.connectedAt;
            this.logger.log(`[${streamId}] Client disconnected after ${duration}ms | ` +
              `Received: ${clientStats.packetsReceived} packets (${this.formatBytes(clientStats.bytesReceived)})`);
            if (tcpSocket) tcpSocket.end();
          });

          ws.on('error', (error) => {
            this.logger.error(`[${streamId}] WebSocket error: ${error.message}`);
            if (tcpSocket) tcpSocket.destroy();
          });
        });

        resolve({
          success: true,
          message: 'Stream started successfully',
          status: 'started',
          data: {
            streamId,
            rtmpUrl,
            wsPort: port,
          },
        });

      } catch (error) {
        clearTimeout(ffmpegStartTimeout);
        this.logger.error(`[${streamId}] Initialization failed: ${error.message}`);
        reject({
          success: false,
          message: error.message,
          status: 'error',
          errorDetails: error.stack || 'No stack trace',
          initializationTime: Date.now() - streamStartTime
        });
      }
    });
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  }

  private buildFfmpegCommand(
    tcpPort: number,
    rtmpUrl: string,
    hlsOutputPath: string,
    config: StartStreamDto,
  ): { command: string } {
    const videoConfig = config.video;
    const audioConfig = config.audio;
    const useDocker = process.env.FFMPEG_DOCKER === 'true';
    const ffmpegPath = useDocker ? 'docker exec ffmpeg ffmpeg' : (process.env.FFMPEG_PATH || 'ffmpeg');

    // Ensure HLS directory exists (using absolute path)
    const absoluteHlsPath = path.resolve(hlsOutputPath);
    try {
      if (!fs.existsSync(absoluteHlsPath)) {
        fs.mkdirSync(absoluteHlsPath, { recursive: true });
        this.logger.debug(`Created HLS directory: ${absoluteHlsPath}`);
      }
    } catch (err) {
      this.logger.error(`Failed to create HLS directory: ${err.message}`);
      throw new Error(`Could not create HLS output directory: ${absoluteHlsPath}`);
    }

    // Input configuration
    const inputParams = [
      `-f mp4`,
      `-listen 1`,
      `-i tcp://0.0.0.0:${tcpPort}?listen`,
      `-fflags +genpts+igndts`,
      `-analyzeduration 100M`,
      `-probesize 100M`,
      `-reconnect 1`,
      `-re`,
      `-reconnect_at_eof 1`,
      `-reconnect_streamed 1`,
      `-reconnect_delay_max 2`,
    ];

    // Video encoding
    const videoParams = [
      `-c:v libx264`,
      `-preset veryfast`,
      `-tune zerolatency`,
      `-profile:v baseline`,
      `-b:v ${videoConfig.bitrate}k`,
      `-maxrate ${videoConfig.maxBitrate}k`,
      `-bufsize ${videoConfig.bufferSize}k`,
      `-g ${videoConfig.gop}`,
      `-keyint_min ${videoConfig.keyintMin}`,
      `-pix_fmt ${videoConfig.pixelFormat}`,
      `-x264-params keyint=${videoConfig.gop}:min-keyint=${videoConfig.keyintMin}`,
      `-movflags +faststart`,
      `-vsync passthrough`,
      `-async 1`,
    ];

    // Audio encoding
    const audioParams = audioConfig.enabled
      ? [
        `-c:a aac`,
        `-ar ${audioConfig.sampleRate}`,
        `-ac ${audioConfig.channels}`,
        `-b:a 128k`,
        `-aac_coder twoloop`,
        `-af aresample=async=1:first_pts=0`,
      ]
      : ['-an'];

    // HLS Output (must come before RTMP)
    const hlsParams = [
      `-f hls`,
      `-hls_time 4`,
      `-hls_list_size 6`,
      `-hls_flags delete_segments+append_list+temp_file`,
      `-hls_segment_filename ${absoluteHlsPath}/segment_%03d.ts`,
      `-hls_allow_cache 1`,
      `-hls_base_url ${absoluteHlsPath}/`, // Ensure proper paths in playlist
      `${absoluteHlsPath}/playlist.m3u8`,
    ];

    // RTMP Output (must come after HLS)
    const outputParams = [
      `-f flv`,
      `-flvflags no_duration_filesize`,
      `"${rtmpUrl}"`,
    ];

    // Build the full command
    const command = [
      ffmpegPath,
      ...inputParams,
      ...videoParams,
      ...audioParams,
      ...hlsParams, // HLS output first
      ...outputParams, // RTMP output second
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