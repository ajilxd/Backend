import { Namespace, Socket } from "socket.io";

interface CustomSocket extends Socket {
  userId?: string;
  roomsJoined?: Set<string>;
}

export function registerNotificationHandlers(
  nsp: Namespace,
  socket: CustomSocket
) {
  socket.on("connect", () => {
    console.log(socket.id + "has connected to the notification system");
  });

  socket.on("user-connect",(data)=>{
    console.log("data payload from connecting notification socket",data)
  })

  socket.on(
    "notification",
    (data: {
      roomId: string;
      message: string;
      type: string;
      timestamp: string;
    }) => {
      console.log("notification from server", data);
      const { roomId, message, type, timestamp } = data;
      const payload = { message, timestamp, type, roomId };

      socket.broadcast.emit("notification", payload);
    }
  );

  socket.on("disconnect", () => {
    console.log(`[${socket.id}] disconnected`);
  });
}
