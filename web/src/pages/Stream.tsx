import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/stores/auth";
import { streams } from "@/lib/api";
import { websocket } from "@/lib/websocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export default function Stream() {
  const { id } = useParams();
  const { user, accessToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // References
  const videoRef = useRef<HTMLVideoElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  // State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamInputId, setStreamInputId] = useState("");

  const { data: stream, isLoading } = useQuery({
    queryKey: ["stream", id],
    queryFn: () => streams.get(id!),
  });

  // Log function similar to the HTML example
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

  const startStreaming = async () => {
    const streamId = id || streamInputId.trim();

    if (!streamId) {
      log("Please enter a stream ID", "error");
      toast({
        title: "Error",
        description: "Please enter a stream ID",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, start the stream in the backend if we have an ID
      if (id) {
        await startStream();
      }

      // Get user media
      log("Requesting camera and microphone access");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      log("Camera and microphone access granted", "success");
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setLocalStream(mediaStream);

      // Connect to socket
      log(`Connecting to WebSocket server for stream: ${streamId}`);
      setConnectionStatus("Connecting...");

      const socket = websocket.connect(accessToken!);
      socketRef.current = socket;

      socket.on("connect", () => {
        log(`Socket connected with ID: ${socket.id}`, "success");
        setConnectionStatus("Socket Connected");

        // Start streaming
        socket.emit("startStreaming", streamId);
        log(`Sent startStreaming request for: ${streamId}`);
      });

      socket.on("streamingStarted", () => {
        log("Streaming started successfully", "success");
        setConnectionStatus("Streaming");
        setIsStreaming(true);
      });

      socket.on("connect_error", (error) => {
        log(`Socket connection error: ${error.message}`, "error");
        setConnectionStatus(`Connection Error: ${error.message}`);
      });

      // Handle new viewer joining
      socket.on("viewerJoined", async (viewerId) => {
        log(`New viewer joined: ${viewerId}`);

        // Create a new peer connection for this viewer
        const peerConnection = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        });

        // Store the peer connection immediately in the ref
        peerConnectionsRef.current.set(viewerId, peerConnection);
        setViewerCount((prev) => prev + 1);

        // Add local tracks to the peer connection
        log(
          `Adding ${
            mediaStream.getTracks().length
          } tracks to peer connection for viewer ${viewerId}`
        );
        mediaStream.getTracks().forEach((track) => {
          log(
            `Adding ${track.kind} track to peer connection for viewer ${viewerId}`
          );
          peerConnection.addTrack(track, mediaStream);
        });

        // Create and send offer
        try {
          log(`Creating offer for viewer ${viewerId}`);
          const offer = await peerConnection.createOffer({
            offerToReceiveAudio: false,
            offerToReceiveVideo: false,
          });

          log(`Setting local description for viewer ${viewerId}`);
          await peerConnection.setLocalDescription(offer);

          log(`Sending offer to viewer ${viewerId}`);
          socket.emit("sendOffer", { streamId, viewerId, offer });
          log(`Offer sent to viewer ${viewerId}`);
        } catch (error: any) {
          log(
            `Error creating offer for viewer ${viewerId}: ${error.message}`,
            "error"
          );
        }

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            log(`Generated ICE candidate for viewer ${viewerId}`);
            socket.emit("sendIceCandidate", {
              streamId,
              viewerId,
              candidate: event.candidate,
            });
          }
        };

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
          log(
            `Connection state changed for viewer ${viewerId}: ${peerConnection.connectionState}`
          );

          if (
            peerConnection.connectionState === "disconnected" ||
            peerConnection.connectionState === "failed" ||
            peerConnection.connectionState === "closed"
          ) {
            // Remove disconnected connections
            peerConnectionsRef.current.delete(viewerId);
            setViewerCount((prev) => Math.max(0, prev - 1));
          }
        };

        // Log ICE gathering state changes
        peerConnection.onicegatheringstatechange = () => {
          log(
            `ICE gathering state for viewer ${viewerId}: ${peerConnection.iceGatheringState}`
          );
        };

        // Log signaling state changes
        peerConnection.onsignalingstatechange = () => {
          log(
            `Signaling state for viewer ${viewerId}: ${peerConnection.signalingState}`
          );
        };
      });

      // Handle viewer answers
      socket.on("answer", async ({ viewerId, answer }) => {
        log(`Received answer from viewer: ${viewerId}`);
        const peerConnection = peerConnectionsRef.current.get(viewerId);

        if (peerConnection) {
          try {
            log(`Setting remote description from viewer ${viewerId}`);
            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(answer)
            );
            log(`Remote description set successfully for viewer ${viewerId}`);
          } catch (error: any) {
            log(
              `Error handling viewer answer for ${viewerId}: ${error.message}`,
              "error"
            );
          }
        } else {
          log(`No peer connection found for viewer: ${viewerId}`, "error");
        }
      });

      // Handle viewer ICE candidates
      socket.on("iceCandidate", async ({ viewerId, candidate }) => {
        log(`Received ICE candidate from viewer: ${viewerId}`);
        const peerConnection = peerConnectionsRef.current.get(viewerId);

        if (peerConnection) {
          try {
            await peerConnection.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
            log(`Added ICE candidate for viewer ${viewerId}`);
          } catch (error: any) {
            log(
              `Error adding viewer ICE candidate for ${viewerId}: ${error.message}`,
              "error"
            );
          }
        }
      });

      // Handle viewer disconnection
      socket.on("viewerDisconnected", (viewerId) => {
        log(`Viewer disconnected: ${viewerId}`);
        const peerConnection = peerConnectionsRef.current.get(viewerId);

        if (peerConnection) {
          peerConnection.close();
          peerConnectionsRef.current.delete(viewerId);
          setViewerCount((prev) => Math.max(0, prev - 1));
        }
      });
    } catch (error: any) {
      log(`Error starting stream: ${error.message}`, "error");
      setConnectionStatus("Error");
      toast({
        title: "Error",
        description: "Failed to start streaming: " + error.message,
        variant: "destructive",
      });
    }
  };

  const stopStreaming = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach((pc, viewerId) => {
      pc.close();
      log(`Closed connection to viewer ${viewerId}`);
    });

    peerConnectionsRef.current.clear();
    setViewerCount(0);

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsStreaming(false);
    setConnectionStatus("Disconnected");
    log("Streaming stopped", "info");

    // If we're on a stream page, end the stream in the backend
    if (id) {
      endStream();
    }
  };

  const { mutate: startStream } = useMutation({
    mutationFn: () => streams.start(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stream", id] });
      toast({
        title: "Success",
        description: "Stream started successfully in the backend",
      });
    },
    onError: (error: any) => {
      log(`Error starting stream in backend: ${error.message}`, "error");
      toast({
        title: "Error",
        description: `Failed to start stream in backend: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const { mutate: endStream } = useMutation({
    mutationFn: () => streams.end(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stream", id] });
      toast({
        title: "Success",
        description: "Stream ended successfully in the backend",
      });
    },
    onError: (error: any) => {
      log(`Error ending stream in backend: ${error.message}`, "error");
      toast({
        title: "Error",
        description: `Failed to end stream in backend: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isStreaming) {
        stopStreaming();
      }
    };
  }, []);

  if (id && isLoading) {
    return <div className="p-8">Loading stream details...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>
            {id ? stream?.title || "Stream" : "WebRTC Streamer Test"}
          </CardTitle>
          <CardDescription>
            {id
              ? `Stream ID: ${id}`
              : "Test your webcam and streaming capabilities"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {!id && (
              <div>
                <Label htmlFor="streamId">Stream ID:</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="streamId"
                    value={streamInputId}
                    onChange={(e) => setStreamInputId(e.target.value)}
                    placeholder="Enter your stream ID"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {!isStreaming ? (
                <Button onClick={startStreaming} disabled={isStreaming}>
                  Start Streaming
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={stopStreaming}
                  disabled={!isStreaming}
                >
                  Stop Streaming
                </Button>
              )}
            </div>

            <div className="stats font-semibold">
              Active Viewers: <span>{viewerCount}</span>
            </div>

            <div className="status p-4 bg-gray-100 rounded-md">
              Status: {connectionStatus}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Local Preview</h2>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto bg-black rounded-md aspect-video object-cover"
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Connection Log</h2>
              <div
                ref={logRef}
                className="h-48 overflow-y-auto bg-gray-50 p-3 font-mono text-sm rounded-md border"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
