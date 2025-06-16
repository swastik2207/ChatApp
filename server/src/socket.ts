import { Server, Socket } from "socket.io";
import { produceMessage } from "./helper.js";

interface CustomSocket extends Socket {
  room?: string;
  userId?: string;
}

// Map to store socket.id → { userId, room }
export const socketToUser = new Map<string, { userId: string; room: string }>();

export function setupSocket(io: Server) {
  io.use((socket: CustomSocket, next) => {
    const room = socket.handshake.auth.room;
    const userId = socket.handshake.auth.userId;

    if (!room || !userId) {
      return next(new Error("Missing room or userId"));
    }

    socket.room = room;
    socket.userId = userId;

    next();
  });

  io.on("connection", (socket: CustomSocket) => {
    socket.join(socket.room!);

    // Track connected user in memory
    socketToUser.set(socket.id, {
      userId: socket.userId!,
      room: socket.room!
    });

    console.log(
      ` User ${socket.userId} joined room ${socket.room} (socket: ${socket.id})`
    );

    socket.on("message", async (data) => {
      try {
        await produceMessage("chats", data);
      } catch (error) {
        console.error(" Kafka produce error:", error);
      }
      socket.to(socket.room!).emit("message", data);
    });

    socket.on("disconnect", () => {
      console.log(` User disconnected: ${socket.id}`);
      socketToUser.delete(socket.id);
    });
  });
}
