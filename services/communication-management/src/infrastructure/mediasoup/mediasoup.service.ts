// src/mediasoup/mediasoup.service.ts
import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import * as mediasoup from 'mediasoup';
import { Worker, Router, WebRtcTransport, Producer } from 'mediasoup/node/lib/types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MediasoupService implements OnModuleDestroy {
    private worker: Worker;
    private router: Router;
    private transports = new Map<string, WebRtcTransport>();
    private producers = new Map<string, Producer>();
    private ffmpegProcesses = new Map<string, any>();
    private readonly logger = new Logger(MediasoupService.name);
    private transportPorts = new Map<string, number>();

    constructor(private configService: ConfigService) { }

    async onModuleInit() {
        await this.createWorker();
        await this.createRouter();
        this.logger.log('Mediasoup service initialized');
    }

    onModuleDestroy() {
        this.logger.log('Closing mediasoup worker');
        this.worker?.close();
    }

    private async createWorker() {
        this.logger.log('Creating mediasoup worker');
        this.worker = await mediasoup.createWorker({
            logLevel: this.configService.get('MEDIASOUP_LOG_LEVEL', 'warn'),
            rtcMinPort: this.configService.get('MEDIASOUP_MIN_PORT', 40000),
            rtcMaxPort: this.configService.get('MEDIASOUP_MAX_PORT', 49999),
        });

        this.worker.on('died', () => {
            this.logger.error('Mediasoup worker died, exiting...');
            process.exit(1);
        });
    }

    private async createRouter() {
        this.logger.log('Creating mediasoup router');
        this.router = await this.worker.createRouter({
            mediaCodecs: [
                {
                    kind: 'audio',
                    mimeType: 'audio/opus',
                    clockRate: 48000,
                    channels: 2,
                },
                {
                    kind: 'video',
                    mimeType: 'video/VP8',
                    clockRate: 90000,
                    parameters: {
                        'x-google-start-bitrate': 1000,
                    },
                },
                {
                    kind: 'video',
                    mimeType: 'video/H264',
                    clockRate: 90000,
                    parameters: {
                        'packetization-mode': 1,
                        'profile-level-id': '4d0032',
                        'level-asymmetry-allowed': 1,
                        'x-google-start-bitrate': 1000,
                    },
                },
            ],
        });
    }

    getRouterCapabilities() {
        this.logger.log('Getting router capabilities');
        return this.router.rtpCapabilities;
    }

    async createWebRtcTransport(options: { forceTcp: boolean; producing: boolean }) {
        this.logger.log(`Creating WebRTC transport (forceTcp: ${options.forceTcp}, producing: ${options.producing})`);
        const transport = await this.router.createWebRtcTransport({
            listenIps: [
                {
                    ip: '0.0.0.0',
                    announcedIp: this.configService.get('MEDIASOUP_ANNOUNCED_IP'),
                },
            ],
            enableUdp: !options.forceTcp,
            enableTcp: true,
            preferUdp: !options.forceTcp,
            appData: { producing: options.producing },
        });

        const port = transport.iceCandidates[0]?.port;
        if (port) {
            this.transportPorts.set(transport.id, port);
        }

        this.transports.set(transport.id, transport);

        // transport.on('close', () => {
        //     this.logger.log(`Transport ${transport.id} closed`);
        //     this.transports.delete(transport.id);
        // });

        return {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
            sctpParameters: transport.sctpParameters,
            port
        };
    }

    async connectTransport(params: { transportId: string; dtlsParameters: any }) {
        this.logger.log(`Connecting transport ${params.transportId}`);
        const transport = this.transports.get(params.transportId);
        if (!transport) {
            throw new Error('Transport not found');
        }
        await transport.connect({ dtlsParameters: params.dtlsParameters });
    }

    async produce(params: {
        transportId: string;
        kind: mediasoup.types.MediaKind;
        rtpParameters: any;
        streamId: string;
    }) {
        this.logger.log(`Producing ${params.kind} for stream ${params.streamId}`);
        const transport = this.transports.get(params.transportId);
        if (!transport) {
            throw new Error('Transport not found');
        }

        const producer = await transport.produce({
            kind: params.kind,
            rtpParameters: params.rtpParameters,
        });

        this.producers.set(producer.id, producer);

        // producer.on('close', () => {
        //     this.logger.log(`Producer ${producer.id} closed`);
        //     this.producers.delete(producer.id);
        //     const ffmpegProcess = this.ffmpegProcesses.get(producer.id);
        //     if (ffmpegProcess) {
        //         ffmpegProcess.kill();
        //         this.ffmpegProcesses.delete(producer.id);
        //     }
        // });

        return { id: producer.id };
    }

    async closeProducer(producerId: string) {
        this.logger.log(`Closing producer ${producerId}`);
        const producer = this.producers.get(producerId);
        if (producer) {
            producer.close();
        }
    }

    async closeTransport(transportId: string) {
        this.logger.log(`Closing transport ${transportId}`);
        const transport = this.transports.get(transportId);
        if (transport) {
            transport.close();
        }
    }

    getTransport(transportId: string): WebRtcTransport {
        const transport = this.transports.get(transportId);
        if (!transport) {
            throw new Error(`Transport ${transportId} not found`);
        }
        return transport;
    }

    getTransportPort(transportId: string): number {
        const port = this.transportPorts.get(transportId);
        if (!port) {
            throw new Error(`Port not found for transport ${transportId}`);
        }
        return port;
    }


}