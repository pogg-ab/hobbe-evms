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
        cameraDevice: string | null,
        rtmpUrl: string,
        streamId: string,
    ): Promise<{ success: boolean; message: string; status: 'started' | 'stopped' | 'error' | 'else'; data?: { streamId: string; rtmpUrl: string } }> {
        return new Promise(async (resolve, reject) => {
            try {
                const { exec } = require('child_process');
                const ffmpegPath = `${process.env.FFMPEG_PATH || 'ffmpeg'}`;

                if (!rtmpUrl || !rtmpUrl.startsWith('rtmp://')) {
                    reject({
                        success: false,
                        message: 'Valid RTMP URL is required (starting with rtmp://)',
                        status: 'error'
                    });
                    return;
                }

                let selectedCamera = cameraDevice;
                const platform = os.platform();
                const isMobile = typeof window !== 'undefined' &&
                    (window.navigator.userAgent.match(/iPhone|iPad|iPod/i) ||
                        window.navigator.userAgent.match(/Android/i));

                let ffmpegCommand = '';

                if (isMobile && window.navigator.userAgent.match(/Android/i)) {
                    if (!selectedCamera) {
                        selectedCamera = '0';
                    }

                    ffmpegCommand = `${ffmpegPath} -f android_camera -camera_index ${selectedCamera} -video_size 1280x720 -framerate 30 ` +
                        `-pix_fmt yuv420p -c:v libx264 -preset veryfast -tune zerolatency -profile:v main ` +
                        `-b:v 2000k -maxrate 2000k -bufsize 4000k -g 60 -keyint_min 60 ` +
                        `-threads 2 -movflags +faststart -f flv "${rtmpUrl}"`;

                } else if (isMobile && window.navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                    if (!selectedCamera) {
                        selectedCamera = '0';
                    }

                    ffmpegCommand = `${ffmpegPath} -f avfoundation -video_size 1280x720 -framerate 30 -i "${selectedCamera}" ` +
                        `-pix_fmt yuv420p -c:v libx264 -preset veryfast -tune zerolatency -profile:v main ` +
                        `-b:v 2000k -maxrate 2000k -bufsize 4000k -g 60 -keyint_min 60 ` +
                        `-threads 2 -movflags +faststart -f flv "${rtmpUrl}"`;

                } else {
                    if (!selectedCamera) {
                        const cameras = await this.listCameras();
                        if (cameras.length === 0) {
                            reject({
                                success: false,
                                message: 'No camera devices found',
                                status: 'error'
                            });
                            return;
                        }
                        selectedCamera = cameras[1].deviceId;
                    }

                    selectedCamera = selectedCamera.replace(/^video=/, '').trim();

                    switch (platform) {
                        case 'win32':
                            ffmpegCommand = `${ffmpegPath} -f dshow -video_size 1280x720 -framerate 30 -rtbufsize 2000000 -i video="${selectedCamera}" ` +
                                `-pix_fmt yuv420p -c:v libx264 -preset veryfast -tune zerolatency -profile:v main ` +
                                `-b:v 2000k -maxrate 2000k -bufsize 4000k -g 60 -keyint_min 60 ` +
                                `-threads 2 -movflags +faststart -f flv "${rtmpUrl}"`;
                            break;

                        case 'darwin':
                            ffmpegCommand = `${ffmpegPath} -f avfoundation -framerate 30 -video_size 1280x720 -i "${selectedCamera}" ` +
                                `-pix_fmt yuv420p -c:v libx264 -preset veryfast -tune zerolatency -profile:v main ` +
                                `-b:v 2000k -maxrate 2000k -bufsize 4000k -g 60 -keyint_min 60 ` +
                                `-threads 2 -movflags +faststart -f flv "${rtmpUrl}"`;
                            break;

                        case 'linux':
                            ffmpegCommand = `${ffmpegPath} -f v4l2 -framerate 30 -video_size 1280x720 -input_format mjpeg -i "${selectedCamera}" ` +
                                `-pix_fmt yuv420p -c:v libx264 -preset veryfast -tune zerolatency -profile:v main ` +
                                `-b:v 2000k -maxrate 2000k -bufsize 4000k -g 60 -keyint_min 60 ` +
                                `-threads 2 -movflags +faststart -f flv "${rtmpUrl}"`;
                            break;

                        default:
                            reject({
                                success: false,
                                message: `Unsupported OS: ${platform}`,
                                status: 'error'
                            });
                            return;
                    }
                }

                const ffmpegProcess = exec(ffmpegCommand, (error) => {
                    if (error) {
                        this.activeProcesses.delete(streamId);

                        let userMessage = 'Streaming error';
                        if (error.message.includes('dshow')) {
                            userMessage = 'Windows camera error - try lower resolution or different format';
                        } else if (error.message.includes('v4l2')) {
                            userMessage = 'Linux camera error - check supported formats';
                        } else if (error.message.includes('Output')) {
                            userMessage = 'Stream output error - check RTMP URL';
                        } else if (isMobile && window.navigator.userAgent.match(/Android/i)) {
                            userMessage = 'Android camera error - check permissions';
                        } else if (isMobile && window.navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                            userMessage = 'iOS camera error - check permissions';
                        }

                        reject({
                            success: false,
                            message: userMessage,
                            status: 'error'
                        });
                        return;
                    }
                });

                this.activeProcesses.set(streamId, ffmpegProcess);

                ffmpegProcess.on('exit', (code) => {
                    this.activeProcesses.delete(streamId);
                });

                resolve({
                    success: true,
                    message: `Stream started successfully`,
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
        return new Promise((resolve, reject) => {
            exec(
                'ffmpeg -f dshow -list_devices true -i dummy',
                { windowsHide: true },
                (error, stdout, stderr) => {
                    const cameras: { deviceId: string; label: string; altDeviceId?: string }[] = [];
                    let currentDevice: { label?: string; altDeviceId?: string } = {};

                    const lines = stderr.split('\n');
                    let inVideoSection = false;

                    for (const line of lines) {
                        if (line.includes('ffmpeg version') || line.includes('configuration:')) {
                            continue;
                        }

                        if (line.includes('"Alternative name"') || line.includes('(video)')) {
                            inVideoSection = true;
                        }

                        if (!inVideoSection) continue;

                        const videoMatch = line.match(/\[dshow @ \w+\]\s+"([^"]+)"\s+\(video\)/);
                        if (videoMatch) {
                            if (currentDevice.label) {
                                cameras.push({
                                    deviceId: `video=${currentDevice.label}`,
                                    label: currentDevice.label,
                                    altDeviceId: currentDevice.altDeviceId
                                });
                            }
                            currentDevice = {
                                label: videoMatch[1].trim(),
                                altDeviceId: undefined
                            };
                            continue;
                        }

                        const altMatch = line.match(/Alternative name\s+"([^"]+)"/);
                        if (altMatch && currentDevice.label) {
                            currentDevice.altDeviceId = altMatch[1].trim();
                            cameras.push({
                                deviceId: `video=${currentDevice.label}`,
                                label: currentDevice.label,
                                altDeviceId: currentDevice.altDeviceId
                            });
                            currentDevice = {};
                        }
                    }

                    if (currentDevice.label) {
                        cameras.push({
                            deviceId: `video=${currentDevice.label}`,
                            label: currentDevice.label,
                            altDeviceId: currentDevice.altDeviceId
                        });
                    }

                    if (cameras.length > 0) {
                        resolve(cameras);
                    } else {
                        reject(new Error(
                            'No cameras found. Possible reasons:\n' +
                            '1. No cameras are connected\n' +
                            '2. Camera access is blocked by privacy settings\n' +
                            '3. FFmpeg lacks dshow support\n' +
                            'Raw FFmpeg output:\n' + stderr
                        ));
                    }
                }
            );
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
                stream.endedAt = new Date();
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