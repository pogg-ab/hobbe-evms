import { io } from "socket.io-client";

// Extract the base URL without the /api prefix
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const BASE_URL = API_URL.endsWith("/api")
  ? API_URL.substring(0, API_URL.length - 4)
  : API_URL;

export const websocket = {
  connect: (token: string) => {
    console.log("🔌 Connecting to WebSocket server at:", `${BASE_URL}/stream`);

    const socket = io(`${BASE_URL}/stream`, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socket.on("connect", () => {
      console.log("✅ Successfully connected to WebSocket server", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ WebSocket connection error:", error.message);
    });

    socket.on("error", (error) => {
      console.error("❌ WebSocket error:", error);
    });

    return socket;
  },
};
