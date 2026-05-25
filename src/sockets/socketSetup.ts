import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { registerChatEvents } from "./chatEvents";

let io: SocketIOServer;

export const initSocket = (server: HttpServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Register feature-specific event handlers
    registerChatEvents(io, socket);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) throw new Error("Socket.io not initialized. Call initSocket first.");
  return io;
};
