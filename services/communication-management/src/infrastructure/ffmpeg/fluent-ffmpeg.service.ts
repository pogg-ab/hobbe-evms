import { Inject, Injectable, Logger } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import { STREAM_REPOSITORY_TOKEN } from 'src/domain/repositories/live-stream/stream.repository.token';
import { IStreamRepository } from 'src/domain/repositories/live-stream/stream.repository';
import * as os from 'os';
import { existsSync } from 'fs';
import { exec } from 'child_process';




@Injectable()
export class FluentFFmpegService {
  private activeProcesses: Map<string, ffmpeg.FfmpegCommand> = new Map();
  private readonly logger = new Logger(FluentFFmpegService.name);


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

  private checkDshowSupport(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      exec('ffmpeg -formats', (err, stdout, stderr) => {
        if (err) {
          this.logger.error('Error checking available formats', err);
          reject(new Error('Error checking available formats'));
        }

        const isDshowAvailable = stdout.includes('dshow');
        resolve(isDshowAvailable);
      });
    });
  }

  async streamCameraToRtmp(
    cameraDevice: string | null,
    rtmpUrl: string,
    streamId: string,
  ): Promise<{ success: boolean; message: string; status: 'started' | 'stopped' | 'error' | 'else'; data?: { streamId: string; rtmpUrl: string } }> {
    return new Promise(async (resolve, reject) => {
      try {


        const ffmpegPath = `${process.env.FFMPEG_PATH}`;
        if (!require('fs').existsSync(ffmpegPath)) {
          throw new Error(`FFmpeg not found at: ${ffmpegPath}`);
        }
        ffmpeg.setFfmpegPath(ffmpegPath);
        if (!rtmpUrl || !rtmpUrl.startsWith('rtmp://')) {
          throw new Error('Valid RTMP URL is required (starting with rtmp://)');
        }

        console.log(`Preparing stream ${streamId} to ${rtmpUrl}`);

        let selectedCamera = cameraDevice;
        if (!selectedCamera) {
          const cameras = await this.listCameras();
          if (cameras.length === 0) {
            throw new Error('No camera devices found');
          }
          selectedCamera = cameras[0].deviceId;
          console.log(`Auto-selected camera: ${cameras[0].label}`);
        }

        console.log(`Configuring camera source: ${selectedCamera}`);

        const command = ffmpeg();

        const isDshowAvailable = await this.checkDshowSupport();


        if (!isDshowAvailable) {
          console.log('DirectShow not available, trying alternative input methods...');
          selectedCamera = "0";
          console.log(`Using fallback camera: ${selectedCamera}`);
        } else {
          console.log('DirectShow available, using dshow...');
          switch (os.platform()) {
            case 'win32': // Windows
              command.input(`video=${selectedCamera}`)
                .inputFormat('dshow')
                .inputOptions(['-framerate 30', '-video_size 640x480']);

              break;

            case 'darwin': // macOS
              command.input(selectedCamera) // Typically "0" or "1"
                .inputFormat('avfoundation')
                .inputOptions([
                  '-framerate 30',
                  '-pixel_format uyvy422'
                ]);
              break;

            case 'linux': // Linux
              command.input(selectedCamera) // Typically "/dev/video0"
                .inputFormat('v4l2')
                .inputOptions([
                  '-framerate 30',
                  '-video_size 640x480',
                  '-input_format mjpeg'
                ]);
              break;

            default:
              throw new Error(`Unsupported OS: ${os.platform()}`);
          }
        }
        command.output(rtmpUrl)
          .outputOptions([
            '-c:v libx264',
            '-preset veryfast',
            '-maxrate 800k',
            '-bufsize 1600k',
            '-vf format=yuv420p,scale=640:360',
            '-c:a aac',
            '-b:a 128k',
            '-f flv',
            '-g 60',
            '-r 30',
            '-flags +global_header',
            '-strict experimental'
          ]);

        command.on('start', (commandLine) => {
          console.log(`FFmpeg command: ${commandLine}`);
          this.activeProcesses.set(streamId, command);

          resolve({
            success: true,
            message: `Stream started successfully`,
            status: 'started',
            data: { streamId, rtmpUrl },
          });
        })
          .on('end', () => {
            console.log(`Stream completed: ${streamId}`);
            this.activeProcesses.delete(streamId);
          })
          .on('error', (err) => {
            console.error(`Stream error: ${err.message}`);
            this.activeProcesses.delete(streamId);

            let userMessage = 'Streaming error';
            if (err.message.includes('dshow')) {
              userMessage = 'Windows camera error - check device name';
            } else if (err.message.includes('v4l2')) {
              userMessage = 'Linux camera error - check permissions';
            } else if (err.message.includes('Output')) {
              userMessage = 'Stream output error - check RTMP URL';
            }

            reject({
              success: false,
              message: userMessage,
              status: 'error'
            });
          })
          .on('stderr', (line) => {
            console.log(`FFmpeg: ${line}`);
          });

        console.log('Starting stream...');
        command.run();

      } catch (error) {
        console.error(`Setup failed: ${error.message}`);
        reject({
          success: false,
          message: error.message,
          status: 'error'
        });
      }
    });
  }


  private async listCameras(): Promise<{ deviceId: string; label: string }[]> {
    switch (os.platform()) {
      case 'win32':
        return this.listWindowsCameras();
      // case 'darwin':
      //   return this.listMacCameras();
      // case 'linux':
      //   return this.listLinuxCameras();
      default:
        throw new Error(`Unsupported platform: ${os.platform()}`);
    }
  }

  private async listWindowsCameras(): Promise<{ deviceId: string; label: string; altDeviceId?: string }[]> {
    return new Promise((resolve) => {
      const cameras: { deviceId: string; label: string; altDeviceId?: string }[] = [];
      let currentDevice: { label?: string; altDeviceId?: string } = {};
      let outputBuffer = '';

      const command = ffmpeg()
        .addOption('-list_devices')
        .addOption('true')
        .addOption('-f')
        .addOption('dshow')
        .addOption('-i')
        .addOption('dummy');

      command.on('stderr', (data) => {
        outputBuffer += data.toString();
        const lines = outputBuffer.split('\n');

        for (const line of lines) {
          if (line.includes('ffmpeg version') || line.includes('configuration:')) continue;

          const videoMatch = line.match(/\[dshow @ \w+\] "([^"]+)" \(video\)/);
          if (videoMatch) {
            currentDevice = {
              label: videoMatch[1],
              altDeviceId: undefined
            };
            continue;
          }

          const altMatch = line.match(/Alternative name "([^"]+)"/);
          if (altMatch && currentDevice.label) {
            currentDevice.altDeviceId = altMatch[1];
            cameras.push({
              deviceId: `video=${currentDevice.label}`,
              label: currentDevice.label,
              altDeviceId: currentDevice.altDeviceId
            });
            currentDevice = {};
          }
        }

        outputBuffer = lines[lines.length - 1];
      });

      command.on('end', () => {
        console.log('Detected cameras:', cameras);
        resolve(cameras);
      });

      command.on('error', (err) => {
        console.error('Device listing error:', err.message);
        resolve(cameras);
      });

      command.run();
    });
  }

  // private async listMacCameras(): Promise<{ deviceId: string; label: string }[]> {
  //   try {
  //     const { stdout } = await execAsync('ffmpeg -f avfoundation -list_devices true -i "" 2>&1 | grep "AVFoundation video devices" -A 10');
  //     const cameras: { deviceId: string; label: string }[] = [];

  //     stdout.split('\n').forEach(line => {
  //       if (line.includes('] ') && line.includes('[')) {
  //         const matches = line.match(/\[(\d+)\] (.*)/);
  //         if (matches && matches.length >= 3) {
  //           cameras.push({
  //             deviceId: matches[1], // Camera index
  //             label: matches[2].trim() // Camera name
  //           });
  //         }
  //       }
  //     });

  //     return cameras;
  //   } catch (error) {
  //     console.error('Error listing Mac cameras:', error);
  //     return [];
  //   }
  // }

  // private async listLinuxCameras(): Promise<{ deviceId: string; label: string }[]> {
  //   try {
  //     // First try V4L2 devices
  //     const devices = await fs.readdir('/dev');
  //     const videoDevices = devices.filter(d => d.startsWith('video'));

  //     // Try to get more info about each device
  //     const cameras = await Promise.all(
  //       videoDevices.map(async (device) => {
  //         const devicePath = `/dev/${device}`;
  //         try {
  //           const { stdout } = await execAsync(`v4l2-ctl --device=${devicePath} --info 2>/dev/null | grep "Card type"`);
  //           const label = stdout.replace('Card type:', '').trim() || `Camera ${device.replace('video', '')}`;
  //           return { deviceId: devicePath, label };
  //         } catch {
  //           return { deviceId: devicePath, label: `Camera ${device.replace('video', '')}` };
  //         }
  //       })
  //     );

  //     return cameras;
  //   } catch (error) {
  //     console.error('Error listing Linux cameras:', error);
  //     return [];
  //   }
  // }

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