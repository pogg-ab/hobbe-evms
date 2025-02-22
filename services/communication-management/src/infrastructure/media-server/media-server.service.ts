import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as NodeMediaServer from 'node-media-server';
import { streamConfig } from './stream.config';

@Injectable()
export class NodeMediaService implements OnModuleInit, OnModuleDestroy {
  private nms: NodeMediaServer;
  private streams: Map<string, NodeMediaServer.Stream> = new Map();

  onModuleInit(): void {
    const nmsConfig = streamConfig().nodeMediaServer;


    console.log('NodeMediaServer Config:', nmsConfig);

    this.nms = new NodeMediaServer({
      ...nmsConfig,
      logType: 3,
    });

    console.log('Starting NodeMediaServer...');
    this.nms.run();
    console.log('NodeMediaServer started.');


  }

  onModuleDestroy(): void {
    if (this.nms) {
      this.nms.stop();
    }
  }

  startStream(url: string, streamId: string): void {
    try {
      console.log(`Starting stream with ID: ${streamId} and URL: ${url}`);

      if (this.streams.has(streamId)) {
        console.warn(`Stream with ID ${streamId} is already active.`);
        return;
      }

      const newStream = { id: streamId, streamPath: url };
      this.streams.set(streamId, newStream);

      if (!this.nms.streams) {
        this.nms.streams = {};
      }

      this.nms.streams[streamId] = {
        id: streamId,
        url: url,
        state: 'active',
      };

      const streamInstance = this.nms.streams[streamId];
      if (streamInstance) {
        streamInstance.state = 'active';
        console.log(`Stream with ID: ${streamId} started at ${url}`);
      }
    } catch (error) {
      console.error(`Failed to start stream with ID: ${streamId}`, error);
    }
  }

  stopStream(streamId: string): void {
    try {
      const stream = this.streams.get(streamId);
      if (!stream) {
        console.error(`Stream with ID ${streamId} not found.`);
        return;
      }

      console.log(`Stopping stream with ID: ${streamId}`);

      const streamInstance = this.nms.streams[streamId];
      if (streamInstance) {
        streamInstance.state = 'stopped';
        delete this.nms.streams[streamId];
        console.log(`Stream with ID: ${streamId} stopped.`);
      }

      this.streams.delete(streamId);
    } catch (error) {
      console.error(`Failed to stop stream with ID: ${streamId}`, error);
    }
  }
}