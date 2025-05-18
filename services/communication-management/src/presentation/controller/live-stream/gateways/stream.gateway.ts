import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UseGuards, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@WebSocketGateway({
  cors: {
    origin: "*",
    credentials: true,
  },
  namespace: "stream",
  transports: ["websocket", "polling"],
})
export class StreamGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private streamers: Map<string, Socket> = new Map();
  private viewers: Map<string, Set<Socket>> = new Map();
  private streamOffers: Map<string, RTCSessionDescriptionInit> = new Map();
  private readonly logger = new Logger(StreamGateway.name);

  constructor(
  ) { }

  afterInit(server: Server) {
    this.logger.log("WebSocket gateway initialized");
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.data = client.data || {};
    client.data.user = { id: "debug-user", username: "debug-user" };
    this.logger.log(`Debug user connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    for (const [streamId, streamer] of this.streamers.entries()) {
      if (streamer.id === client.id) {
        this.streamers.delete(streamId);
        this.streamOffers.delete(streamId);
        this.server.to(streamId).emit("streamerDisconnected");
        this.logger.log(`Streamer disconnected from stream: ${streamId}`);
        break;
      }
    }
    for (const [streamId, viewers] of this.viewers.entries()) {
      if (viewers.has(client)) {
        viewers.delete(client);
        this.logger.log(`Viewer removed from stream: ${streamId}`);
        const streamer = this.streamers.get(streamId);
        if (streamer) {
          streamer.emit("viewerDisconnected", client.id);
          this.logger.log(
            `Notified streamer about viewer disconnection: ${client.id}`
          );
        }

        if (viewers.size === 0) {
          this.viewers.delete(streamId);
          this.logger.log(`No more viewers for stream: ${streamId}`);
        }
      }
    }
  }

  @SubscribeMessage("startStreaming")
  async handleStartStreaming(client: Socket, streamId: string) {
    this.logger.log(`Start streaming request for stream: ${streamId}`);
    this.logger.log(`DEBUG: Allowing any user to stream for testing purposes`);
    this.streamers.set(streamId, client);
    client.join(streamId);
    client.emit("streamingStarted");
    this.logger.log(`Streaming started for stream: ${streamId}`);

    /* Original code - commented out for testing
    const user = client.data.user;
    const stream = await this.streamService.getStream(streamId);

    if (!stream || stream.userId !== user.id) {
      this.logger.warn(`Unauthorized streaming attempt for stream: ${streamId}`);
      client.emit("error", "Unauthorized");
      return;
    }

    this.streamers.set(streamId, client);
    client.join(streamId);
    client.emit("streamingStarted");
    this.logger.log(`Streaming started for stream: ${streamId}`);
    */
  }

  @SubscribeMessage("joinStream")
  async handleJoinStream(client: Socket, streamId: string) {
    this.logger.log(`Join stream request for stream: ${streamId}`);

    if (!this.viewers.has(streamId)) {
      this.viewers.set(streamId, new Set());
    }
    this.viewers.get(streamId)!.add(client);
    client.join(streamId);
    this.logger.log(`Viewer joined stream: ${streamId}`);

    const streamer = this.streamers.get(streamId);
    if (streamer) {
      streamer.emit("viewerJoined", client.id);
      this.logger.log(`Notified streamer of new viewer: ${client.id}`);

      const offer = this.streamOffers.get(streamId);
      if (offer) {
        client.emit("broadcastOffer", { streamId, offer });
        this.logger.log(`Sent existing offer to new viewer: ${client.id}`);
      } else {
        this.logger.warn(
          `No offer available to send to new viewer: ${client.id}`
        );
      }
    } else {
      this.logger.warn(`Streamer not found for stream: ${streamId}`);
    }

    /* Original code - commented out for testing
    const stream = await this.streamService.getStream(streamId);
    if (!stream) {
      this.logger.warn(`Stream not found: ${streamId}`);
      client.emit("error", "Stream not found");
      return;
    }
    */
  }

  @SubscribeMessage("broadcastOffer")
  handleBroadcastOffer(
    client: Socket,
    { streamId, offer }: { streamId: string; offer: RTCSessionDescriptionInit }
  ) {
    this.logger.log(`Broadcast offer for stream: ${streamId}`);
    const streamer = this.streamers.get(streamId);
    if (streamer && streamer.id === client.id) {
      this.streamOffers.set(streamId, offer);
      this.server.to(streamId).emit("broadcastOffer", { streamId, offer });
      this.logger.log(`Offer broadcast to all viewers in stream: ${streamId}`);
    } else {
      this.logger.warn(
        `Unauthorized offer broadcast attempt for stream: ${streamId}`
      );
    }
  }

  @SubscribeMessage("sendOffer")
  handleSendOffer(
    client: Socket,
    {
      streamId,
      viewerId,
      offer,
    }: {
      streamId: string;
      viewerId: string;
      offer: RTCSessionDescriptionInit;
    }
  ) {
    this.logger.log(
      `Sending offer to viewer: ${viewerId} for stream: ${streamId}`
    );
    const streamer = this.streamers.get(streamId);
    if (streamer && streamer.id === client.id) {
      this.server.to(viewerId).emit("offer", { streamId, offer });
      this.logger.log(`Offer sent to viewer: ${viewerId}`);
    } else {
      this.logger.warn(
        `Unauthorized offer send attempt for stream: ${streamId}`
      );
    }
  }

  @SubscribeMessage("sendIceCandidate")
  handleSendIceCandidate(
    client: Socket,
    {
      streamId,
      viewerId,
      candidate,
    }: {
      streamId: string;
      viewerId: string;
      candidate: RTCIceCandidateInit;
    }
  ) {
    this.logger.log(
      `Sending ICE candidate to viewer: ${viewerId} for stream: ${streamId}`
    );
    const streamer = this.streamers.get(streamId);
    if (streamer && streamer.id === client.id) {
      // Send ICE candidate to specific viewer
      this.server.to(viewerId).emit("iceCandidate", {
        streamId,
        candidate,
      });
      this.logger.log(`ICE candidate sent to viewer: ${viewerId}`);
    } else {
      this.logger.warn(
        `Unauthorized ICE candidate send attempt for stream: ${streamId}`
      );
    }
  }

  @SubscribeMessage("answer")
  handleAnswer(
    client: Socket,
    {
      streamId,
      answer,
    }: { streamId: string; answer: RTCSessionDescriptionInit }
  ) {
    this.logger.log(`Answer from viewer: ${client.id} for stream: ${streamId}`);
    const streamer = this.streamers.get(streamId);
    if (streamer) {
      streamer.emit("answer", { viewerId: client.id, answer });
      this.logger.log(`Answer forwarded to streamer from viewer: ${client.id}`);
    } else {
      this.logger.warn(
        `Streamer not found for answer from viewer: ${client.id}`
      );
    }
  }

  @SubscribeMessage("iceCandidate")
  handleIceCandidate(
    client: Socket,
    {
      streamId,
      candidate,
    }: { streamId: string; candidate: RTCIceCandidateInit }
  ) {
    this.logger.log(
      `ICE candidate from viewer: ${client.id} for stream: ${streamId}`
    );
    const streamer = this.streamers.get(streamId);
    if (streamer) {
      streamer.emit("iceCandidate", { viewerId: client.id, candidate });
      this.logger.log(
        `ICE candidate forwarded to streamer from viewer: ${client.id}`
      );
    } else {
      this.logger.warn(
        `Streamer not found for ICE candidate from viewer: ${client.id}`
      );
    }
  }
}
