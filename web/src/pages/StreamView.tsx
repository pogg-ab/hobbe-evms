import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/stores/auth";
import { streams } from "@/lib/api";
import { websocket } from "@/lib/websocket";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function StreamView() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<any>(null);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const logRef = useRef<HTMLDivElement>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const remoteDescriptionSetRef = useRef<boolean>(false);

  const { data: stream, isLoading } = useQuery({
    queryKey: ["stream", id],
    queryFn: () => streams.get(id!),
  });

  const log = (
    message: string,
    type: "info" | "success" | "error" = "info"
  ) => {
    console.log(message);
    if (logRef.current) {
      const entry = document.createElement("div");
      const time = new Date().toLocaleTimeString();
      entry.textContent = `[${time}] ${message}`;
      entry.style.color =
        type === "error" ? "red" : type === "success" ? "green" : "black";
      logRef.current.appendChild(entry);
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  };

  const applyPendingCandidates = async (pc: RTCPeerConnection) => {
    if (pendingCandidatesRef.current.length > 0) {
      log(
        `Applying ${pendingCandidatesRef.current.length} pending ICE candidates`,
        "info"
      );

      try {
        for (const candidate of pendingCandidatesRef.current) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          log("Applied pending ICE candidate", "success");
        }
        pendingCandidatesRef.current = [];
      } catch (error: any) {
        log(`Error applying pending ICE candidates: ${error.message}`, "error");
      }
    }
  };

  const setupPeerConnection = () => {
    log("Setting up WebRTC peer connection");
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    remoteDescriptionSetRef.current = false;

    pc.ontrack = (event) => {
      log(`Received track: ${event.track.kind}`);

      if (event.streams && event.streams[0]) {
        log(`Setting video source to received stream`, "success");
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
          setConnectionStatus("Receiving Video Stream");
        }
      } else {
        log(`Track received without stream`, "error");
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        log(`Generated ICE candidate, sending to streamer`);
        socketRef.current.emit("iceCandidate", {
          streamId: id,
          viewerId: socketRef.current.id,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      log(`Connection state changed: ${pc.connectionState}`);

      if (pc.connectionState === "connected") {
        log(`WebRTC connected successfully!`, "success");
        setConnectionStatus("WebRTC Connected");
      } else if (
        ["failed", "disconnected", "closed"].includes(pc.connectionState)
      ) {
        log(`WebRTC connection ${pc.connectionState}`, "error");
        setConnectionStatus(`WebRTC ${pc.connectionState}`);
      }
    };

    pc.onicegatheringstatechange = () => {
      log(`ICE gathering state: ${pc.iceGatheringState}`);
    };

    pc.onsignalingstatechange = () => {
      log(`Signaling state: ${pc.signalingState}`);
    };

    return pc;
  };

  useEffect(() => {
    if (!stream?.isLive || !accessToken) {
      return;
    }

    log(`Connecting to stream: ${id}`);
    setConnectionStatus("Connecting...");

    pendingCandidatesRef.current = [];
    remoteDescriptionSetRef.current = false;

    const socket = websocket.connect(accessToken);
    socketRef.current = socket;

    socket.on("connect", () => {
      log(`Socket connected with ID: ${socket.id}`, "success");
      setConnectionStatus("Socket Connected, joining stream...");

      socket.emit("joinStream", id);
      log(`Sent joinStream request for: ${id}`);
      const pc = setupPeerConnection();
      peerConnectionRef.current = pc;
    });

    socket.on("connect_error", (error) => {
      log(`Socket connection error: ${error.message}`, "error");
      setConnectionStatus(`Connection Error: ${error.message}`);
    });

    socket.on("disconnect", () => {
      log("Disconnected from WebSocket server", "error");
      setConnectionStatus("Disconnected");
    });
    socket.on("offer", async ({ streamId, viewerId, offer }) => {
      log(`Received offer from stream: ${streamId}`);

      if (peerConnectionRef.current) {
        try {
          log(`Setting remote description from offer`);
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(offer)
          );
          remoteDescriptionSetRef.current = true;
          await applyPendingCandidates(peerConnectionRef.current);

          log(`Creating answer`);
          const answer = await peerConnectionRef.current.createAnswer();

          log(`Setting local description with answer`);
          await peerConnectionRef.current.setLocalDescription(answer);

          log(`Sending answer to streamer`);
          socket.emit("answer", { streamId, viewerId, answer });
          log(`Answer sent successfully`, "success");
        } catch (error: any) {
          log(`Error handling offer: ${error.message}`, "error");
          toast({
            title: "Error",
            description: "Failed to connect to stream: " + error.message,
            variant: "destructive",
          });
        }
      } else {
        log(`Error: Peer connection not initialized`, "error");
      }
    });
    socket.on("iceCandidate", async ({ streamId, viewerId, candidate }) => {
      log(`Received ICE candidate from streamer`);

      if (peerConnectionRef.current && remoteDescriptionSetRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
          log(`Added ICE candidate successfully`);
        } catch (error: any) {
          log(`Error adding ICE candidate: ${error.message}`, "error");
        }
      } else {
        log(`Buffering ICE candidate - no remote description yet`);
        pendingCandidatesRef.current.push(candidate);
      }
    });

    socket.on("streamerDisconnected", () => {
      log(`Streamer disconnected`, "error");
      setConnectionStatus("Streamer Disconnected");
      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        videoRef.current.srcObject = null;
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    });

    return () => {
      log("Cleaning up viewer component");
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (socket) {
        socket.disconnect();
      }
      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        videoRef.current.srcObject = null;
      }
    };
  }, [stream?.isLive, id, accessToken, toast]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = () => {
        log(
          `Video metadata loaded: ${videoRef.current?.videoWidth}x${videoRef.current?.videoHeight}`,
          "success"
        );
      };

      videoRef.current.onplay = () => {
        log("Video playback started", "success");
      };

      videoRef.current.onerror = (e) => {
        log(`Video error: ${videoRef.current?.error?.message || e}`, "error");
      };
    }
  }, []);

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!stream) {
    return <div className="p-8">Stream not found</div>;
  }

  if (!stream.isLive) {
    return <div className="p-8">Stream is offline</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>{stream.title}</CardTitle>
          <CardDescription>
            Stream ID: {id} • Started{" "}
            {new Date(stream.startedAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="status p-4 bg-gray-100 text-sm rounded">
              <p className="font-bold">Status: {connectionStatus}</p>
            </div>
          </div>

          <div className="aspect-video bg-black mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              controls
              className="w-full h-full object-contain"
            />
          </div>

          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Connection Log</h2>
            <div
              ref={logRef}
              className="h-48 overflow-y-auto bg-gray-50 p-2 text-sm font-mono rounded border"
            ></div>
          </div>

          <div className="mt-4">
            <p className="text-gray-600">{stream.description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
