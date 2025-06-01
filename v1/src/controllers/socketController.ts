import { Server, Socket } from "socket.io";
import ChatRepository from "../repositories/implementations/ChatRepository";

interface CustomSocket extends Socket {
  senderId?: string;
  senderName?: string;
  room?: string;
  userId?: string;
}

type SocketInfoType = {
  rooms: Set<string>;
  sockets: Set<string>;
  lastSeen?: Date;
  senderName?: string;
  senderImageUrl?: string;
};

type RoomSocketInfo = {
  userId: string;
  lastSeen: string;
  typing?: boolean;
};

const userSocketMap: Record<string, SocketInfoType> = {};
const roomSocketMap: Record<string, RoomSocketInfo[]> = {};

export function registerSocketHandlers(io: Server, socket: CustomSocket) {
  socket.on("user-connected", (data) => {
    console.log("data from user connected", data);
    const { userId } = data;
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = {
        rooms: new Set(),
        sockets: new Set(),
        lastSeen: new Date(),
        senderImageUrl: data.senderImageUrl,
        senderName: data.senderName,
      };
    }

    userSocketMap[userId].sockets.add(socket.id);
    socket.userId = userId;
    console.log(`✅ User ${userId} registered with socket ${socket.id}`);
    console.log("hey iam user socket map",userSocketMap)
  });

  socket.on("join-room", (data) => {
    const { room, userId } = data;

    if (!userId) return;
    socket.join(room);
    userSocketMap[userId]?.rooms.add(room);

    if (!roomSocketMap[room]) roomSocketMap[room] = [];

    const existing = roomSocketMap[room].find(
      (entry) => entry.userId === userId
    );
    if (!existing) {
      roomSocketMap[room].push({ userId, lastSeen: new Date().toISOString() });
    } else {
      existing.lastSeen = new Date().toISOString();
    }
    io.to(data.room).emit("online-users", roomSocketMap[room]);
    console.log(`➡️ User ${socket.id} joined room: ${room}`);
  });

  socket.on("send-message", async (data) => {
    console.log(data);
    console.log(
      `📨 Message from ${data.senderName} to room ${data.room}`,
      data
    );
    await ChatRepository.create(data);
    socket.to(data.room).emit("receive-message", data);
  });

  socket.on("disconnect", () => {
    const { userId } = socket;
    console.log(`❌ User disconnected: ${socket.id}`);

    if (userId && userSocketMap[userId]) {
      userSocketMap[userId].sockets.delete(socket.id);

      if (userSocketMap[userId].sockets.size === 0) {
        for (const room of userSocketMap[userId].rooms) {
          if (roomSocketMap[room]) {
            roomSocketMap[room] = roomSocketMap[room].filter(
              (entry) => entry.userId !== userId
            );
            io.to(room).emit("online-users", roomSocketMap[room]);
          }
        }
        delete userSocketMap[userId];
      }
    }
  });

  socket.on("user-disconnect", (data) => {
    const { userId } = data;
    console.log("from user disconnected ", data);
    if (userId && userSocketMap[userId]) {
      for (const room of userSocketMap[userId].rooms) {
        roomSocketMap[room] = roomSocketMap[room].filter(
          (entry) => entry.userId !== userId
        );
        io.to(room).emit("online-users", roomSocketMap[room]);
      }
      delete userSocketMap[userId];
    }
  });

  socket.on("typing", (data) => {
    console.log("data from typing", data);
    const { userId, room } = data;
    if (userId && roomSocketMap[room]) {
      roomSocketMap[room].map((i) => {
        if (i.userId === userId) {
          i.typing = true;
        }
      });
    }

    const typingFiltered = roomSocketMap[room]
      .filter((i) => i.typing === true)
      .map((i) => {
        return {
          ...i,
          senderName: userSocketMap[i.userId]?.senderName,
          senderImageUrl: userSocketMap[i.userId]?.senderImageUrl,
        };
      });
    socket.to(room).emit("typing", typingFiltered);
    console.log("user socket map",userSocketMap)
  });

  socket.on("stop-typing", (data) => {
    console.log("data from stop typing", data);
    const { userId, room } = data;
    if (userId && roomSocketMap[room]) {
      roomSocketMap[room].map((i) => {
        if (i.userId === userId) {
          i.typing = false;
        }
      });
    }

    const typingFiltered = roomSocketMap[room]
      .filter((i) => i.typing === true)
      .map((i) => {
        return {
          ...i,
          senderName: userSocketMap[i.userId]?.senderName,
          senderImageUrl: userSocketMap[i.userId]?.senderImageUrl,
        };
      });
    socket.to(room).emit("stop-typing", typingFiltered);
  });
}

export { userSocketMap };
