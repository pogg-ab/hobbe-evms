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
import * as mediasoup from 'mediasoup';
import { ChildProcess } from 'child_process';
type StreamStatus = 'started' | 'stopped' | 'paused' | 'error';

interface FfmpegResponse {
    success: boolean;
    message: string;
    status: StreamStatus;
    data?: { streamId: string; rtmpUrl: string; wsPort: number };
}
@Injectable()
export class StreamService {
    private readonly logger = new Logger(StreamService.name);
    private worker: mediasoup.types.Worker;
    private router: mediasoup.types.Router;
    private transports = new Map<string, mediasoup.types.WebRtcTransport>();
    private producers = new Map<string, mediasoup.types.Producer>();
    private activeProcesses = new Map<string, ChildProcess>();
    constructor(
        @Inject(STREAM_REPOSITORY_TOKEN)
        private readonly streamRepository: IStreamRepository,
        private readonly nodeMediaService: NodeMediaService,
        private readonly fluentFFmpegService: FluentFFmpegService,
    ) { }

    private async initializeMediasoup() {
        this.worker = await mediasoup.createWorker({
            logLevel: 'debug',
            rtcMinPort: 10000,
            rtcMaxPort: 10100,
        });

        this.worker.on('died', () => {
            this.logger.error('Mediasoup worker died');
        });

        this.router = await this.worker.createRouter({
            mediaCodecs: [
                {
                    kind: 'video',
                    mimeType: 'video/H264',
                    clockRate: 90000,
                    parameters: {
                        'profile-level-id': '42e01f',
                        'packetization-mode': 1,
                    },
                },
                {
                    kind: 'audio',
                    mimeType: 'audio/opus',
                    clockRate: 48000,
                    channels: 2,
                },
            ],
        });

    }

    async getInactiveStreams(): Promise<Stream[]> {
        try {
            return await this.streamRepository.findByStatus('inactive');
        } catch (error) {
            this.logger.error(`Failed to fetch inactive streams: ${error.message}`);
            throw new InternalServerErrorException(`Failed to fetch inactive streams: ${error.message}`);
        }
    }

    async getRouterRtpCapabilities() {
        try {
            return await this.router.rtpCapabilities;
        } catch (error) {
            this.logger.error(`Failed to fetch RTP capabilities: ${error.message}`);
            throw new InternalServerErrorException(`Failed to fetch RTP capabilities: ${error.message}`);
        }
    }

    async createProducerTransport(streamId: string) {
        try {
            const transport = await this.router.createWebRtcTransport({
                listenIps: [{ ip: '0.0.0.0', announcedIp: '127.0.0.1' }],
                enableUdp: true,
                enableTcp: true,
                preferUdp: true,
            });

            this.transports.set(`${streamId}-${transport.id}`, transport);
            return {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters,
            };
        } catch (error) {
            this.logger.error(`Failed to create producer transport: ${error.message}`);
            throw new InternalServerErrorException(`Failed to create producer transport: ${error.message}`);
        }
    }

    async connectProducerTransport(streamId: string, dtlsParameters: any) {
        try {
            const transport = Array.from(this.transports.values()).find(t => t.id === dtlsParameters.transportId);
            if (!transport) throw new NotFoundException('Transport not found');
            await transport.connect({ dtlsParameters });
        } catch (error) {
            this.logger.error(`Failed to connect producer transport: ${error.message}`);
            throw new InternalServerErrorException(`Failed to connect producer transport: ${error.message}`);
        }
    }

    async produce(streamId: string, transportId: string, kind: mediasoup.types.MediaKind, rtpParameters: any) {
        try {
            // Validate kind
            if (!['audio', 'video'].includes(kind)) {
                throw new BadRequestException(`Invalid media kind: ${kind}. Must be 'audio' or 'video'.`);
            }

            const transport = this.transports.get(`${streamId}-${transportId}`);
            if (!transport) throw new NotFoundException('Transport not found');

            const producer = await transport.produce({ kind, rtpParameters });
            this.producers.set(`${streamId}-${producer.id}`, producer);
            return { id: producer.id };
        } catch (error) {
            this.logger.error(`Failed to produce track: ${error.message}`);
            throw new InternalServerErrorException(`Failed to produce track: ${error.message}`);
        }
    }

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
            stream.hlsOutputPath = `${process.env.HLS_OUTPUT_BASE_PATH}/${streamKey}`;

            if (startDate) {
                stream.startedAt = new Date(startDate);
            }
            if (endDate) {
                stream.endedAt = new Date(endDate);
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

    async scheduleStream(
        userId: string,
        eventId: string,
        scheduledDate: Date,
        scheduledTime: string,
        timezone?: string
    ): Promise<{ success: boolean; message: string; data: Stream }> {
        try {
            const scheduledDateTime = this.combineDateTime(scheduledDate, scheduledTime, timezone);

            const stream = new Stream();
            stream.status = 'inactive';
            stream.userId = userId;
            stream.eventId = eventId;
            stream.startedAt = scheduledDateTime;
            stream.createdBy = userId;
            stream.updatedAt = new Date();

            const dateString = scheduledDateTime
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


    private combineDateTime(date: Date, time: string, timezone?: string): Date {
        const [hours, minutes] = time.split(':').map(Number);
        const result = new Date(date);
        result.setHours(hours, minutes);
        return result;
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
            if (stream.startedAt && now < new Date(stream.startedAt)) {
                throw new BadRequestException({
                    success: false,
                    message: 'Stream cannot start before scheduled time',
                    scheduledTime: stream.startedAt,
                    currentTime: now.toISOString()
                });
            }

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
            stream.endedAt = new Date();
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
            stream.startedAt = new Date();
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
            stream.endedAt = new Date();
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
