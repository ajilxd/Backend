import { Namespace, Socket } from "socket.io";
import { Notification } from "../schemas/notificationSchema";
import { logger } from "../utils/logger";
import UserChatService from "../services/implementation/UserChatService";

interface CustomSocket extends Socket {
  userId?: string;
  roomsJoined?: Set<string>;
}

type Consumer = {
  consumerId: string;
  consumerName: string;
  consumerImageUrl?: string;
  consumerRole?: string;
  consumerLastActive?: string;
  consumerSpaces?: string;
  socketId?: string;
};

type CompanyConsumerMapEntry = {
  consumers: Consumer[];
};

type CompanyConsumerMap = Map<string, CompanyConsumerMapEntry>;

let CompanyResources: CompanyConsumerMap = new Map();

export function registerNotificationHandlers(
  nsp: Namespace,
  socket: CustomSocket
) {
  socket.on("connect", () => {
    console.log(socket.id + "has connected to the notification system");
  });

  socket.on("user-connect", (data) => {
    console.log("data payload from connecting notification socket", data);
    const { companyId, consumerId } = data;
    const resources = CompanyResources.get(companyId);
    if (!resources) {
      CompanyResources.set(companyId, {
        consumers: [{ ...data, socketId: socket.id }],
      });
    } else {
      const existing = CompanyResources.get(companyId)?.consumers.find(
        (i) => i.consumerId === consumerId
      );
      if (existing) {
        existing.socketId = socket.id;
      } else {
        resources.consumers.push({ ...data, socketId: socket.id });
      }
    }
    socket.join(companyId);
    console.log(CompanyResources.get(companyId));
  });

  socket.on(
    "notification",
    async (data: {
      targetSpaceId: string;
      companyId: string;
      notificationContent: string;
      notificationType: string;
      notificationTimeStamp: string;
      storeNotificationOnDb: boolean;
    }) => {
      console.log("notification from server", data);
      if (data.storeNotificationOnDb) {
        async function updateDb() {
          await Notification.create(data);
        }
        updateDb()
          .then(() => console.log("notification inserted to db"))
          .catch((err) => console.log("error happened " + err));
      }
      const { companyId } = data;
      socket.to(companyId).emit("notification", data);
    }
  );

  socket.on("send-peer-message", async (data) => {
    logger.info(
      `📨 Message from ${data.senderId} to peer ${data.receiverId} of chatId(${data.chatId}) - ${data.content}`
    );

    console.log(`data from send-peer-message`, data);

    const chatExists = await UserChatService.findChatByParticipantsId(
      data.senderId,
      data.receiverId
    );
    console.log(`chat exists or not ${chatExists.length}`);

    if (!chatExists.length) {
      const newChat = await UserChatService.createChat({
        participants: [data.senderId, data.receiverId],
        lastMessage: data.content,
        lastMessageTime: new Date(),
        participantsMetadata: data.participantsMetadata,
      });
      const message = await UserChatService.createMessageByChatId({
        ...data,
        chatId: newChat.chatId,
      });
      const receiverSocketId = CompanyResources.get(
        data.companyId
      )?.consumers.find((i) => i.consumerId === data.receiverId)?.socketId;
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit("receive-peer-message", message);
        console.log("Message has been send to the ", receiverSocketId);
      } else {
        logger.warn(
          `Failed to find the socket Id for the consumer with ID ${data.receiverId} of company ${data.companyId} of new chat`
        );
      }
    } else {
      await UserChatService.updateChatLastMessage(chatExists[0].chatId, {
        lastMessage: data.content,
        lastMessageTime: new Date(),
        participantsMetadata: data.participantsMetadata,
      });
      const message = await UserChatService.createMessageByChatId({
        ...data,
        chatId: chatExists[0].chatId,
      });
      const receiverSocketId = CompanyResources.get(
        data.companyId
      )?.consumers.find((i) => i.consumerId === data.receiverId)?.socketId;
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit("receive-peer-message", message);
        console.log("Message has been send to the ", receiverSocketId);
      } else {
        logger.warn(
          `Failed to find the socket Id for the consumer with ID ${data.receiverId} of company ${data.companyId}`
        );
      }
    }
  });

  socket.on("meeting", (data) => {
    const { companyId } = data;
    socket.to(companyId).emit("meeting", data);
  });

  socket.on("space", (data) => {
    const { companyId } = data;
    console.log("new space event", data);
    socket.to(companyId).emit("space", data);
  });

  socket.on("disconnect", () => {
    console.log(`[${socket.id}] disconnected`);
  });
}
