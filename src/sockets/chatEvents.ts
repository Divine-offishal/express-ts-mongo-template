import { Server as SocketIOServer, Socket } from "socket.io";

/**
 * Example: Chat event handlers.
 * Import and call registerChatEvents(io, socket) from socketSetup.ts.
 *
 * Client usage:
 *   socket.emit("chat:join", { roomId: "abc123" });
 *   socket.emit("chat:message", { roomId: "abc123", text: "Hello!" });
 *   socket.on("chat:message", (data) => console.log(data));
 */
export const registerChatEvents = (io: SocketIOServer, socket: Socket) => {
  // Join a room
  socket.on("chat:join", ({ roomId }: { roomId: string }) => {
    socket.join(roomId);
    socket.to(roomId).emit("chat:joined", {
      socketId: socket.id,
      roomId,
    });
  });

  // Send a message to a room
  socket.on(
    "chat:message",
    ({ roomId, text, senderId }: { roomId: string; text: string; senderId: string }) => {
      const message = {
        senderId,
        text,
        roomId,
        timestamp: new Date().toISOString(),
      };

      // Broadcast to everyone in the room including sender
      io.to(roomId).emit("chat:message", message);
    }
  );

  // Typing indicator
  socket.on("chat:typing", ({ roomId, userId }: { roomId: string; userId: string }) => {
    socket.to(roomId).emit("chat:typing", { userId, roomId });
  });

  // Leave a room
  socket.on("chat:leave", ({ roomId }: { roomId: string }) => {
    socket.leave(roomId);
    socket.to(roomId).emit("chat:left", { socketId: socket.id, roomId });
  });
};
