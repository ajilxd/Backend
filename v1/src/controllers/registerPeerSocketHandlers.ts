import { Namespace, Socket } from "socket.io";
import { routerResources, transports } from "./mediasoupHandler";
import {
  MediaKind,
  RtpParameters,
} from "mediasoup/node/lib/rtpParametersTypes";
import { logger } from "../utils/logger";

export const producers = new Map<string, any>();
export const consumers = new Map<string, any>();
const connectingTransports = new Set<string>();

interface CustomSocket extends Socket {
  producers?: Set<string>;
  consumers?: Set<string>;
  userId?: string;
  meetingId?: string;
}

const cleanupPeerResources = (socket: CustomSocket) => {
  if (socket.producers) {
    for (const producerId of socket.producers) {
      const producer = producers.get(producerId);
      if (producer) {
        producer.close();
        logger.info(`Closed producer ${producerId} from ${socket.id}`);
        producers.delete(producerId);
      }
    }
  }

  if (socket.consumers) {
    const resources = routerResources.get(socket.meetingId!);
    // console.log("consumers before deletion of lefteee's consumers ", consumers);
    for (const consumerId of socket.consumers) {
      const consumer = consumers.get(consumerId);
      if (consumer) {
        consumer.close();
        logger.info(`Closed consumer ${consumerId} from ${socket.id}`);
        consumers.delete(consumerId);
        // console.log(
        //   "consumers after deletion of lefteee's consumers ",
        //   consumers
        // );
      }
      if (resources) {
        resources.consumers.delete(consumer);
        const hasDeletedconsumer = resources.consumers.has(consumer);
        // console.log(
        //   "is the consumer of leftee getting deleted",
        //   hasDeletedconsumer
        // );
      }
    }
  }

  for (const [transportId, transport] of transports) {
    if (transport.appData.userId === socket.userId) {
      transport.close();
      transports.delete(transportId);
      logger.info(`Closed transport ${transportId} for user ${socket.userId}`);
    }
  }
};

export function registerPeerSocketHandlers(
  nsp: Namespace,
  socket: CustomSocket
) {
  socket.on(
    "connect-transport",
    async (
      { transportId, dtlsParameters },
      callback: (response: { error?: string }) => void
    ) => {
      console.log(`[${socket.id}] connect-transport: ${transportId}`);

      try {
        const transport = transports.get(transportId);
        if (!transport) throw new Error("Transport not found");

        if (connectingTransports.has(transportId)) {
          return callback({
            error: "Transport connection already in progress",
          });
        }
        connectingTransports.add(transportId);

        await transport.connect({ dtlsParameters });
        logger.info(`[${socket.id}] Transport ${transportId} connected`);

        callback({});
      } catch (error: any) {
        logger.error(`[${socket.id}] connect-transport error:`, error.message);
        callback({ error: error.message });
      } finally {
        connectingTransports.delete(transportId);
      }
    }
  );

  socket.on(
    "produce",
    async (
      {
        transportId,
        kind,
        rtpParameters,
        userId,
        meetingId,
      }: {
        transportId: string;
        kind: "audio" | "video";
        rtpParameters: any;
        userId: string;
        meetingId: string;
      },
      callback: (response: { error?: string; id?: string }) => void
    ) => {
      logger.info(
        `[${socket.id}] produce called for ${kind} via transport ${transportId}`
      );

      try {
        console.log("from producer event listener", { meetingId, userId });
        const transport = transports.get(transportId);
        if (!transport) throw new Error("Transport not found");

        const producer = await transport.produce({
          kind,
          rtpParameters,
          appData: { userId, meetingId },
        });
        producers.set(producer.id, producer);
        const resources = routerResources.get(meetingId);
        if (resources) {
          resources.producers.add(producer);
        } else {
          logger.info("no router resources map found ");
        }

        socket.producers = socket.producers || new Set<string>();
        socket.producers.add(producer.id);

        logger.info(`[${socket.id}] ${kind} producer created: ${producer.id}`);
        // console.log("router resources", routerResources);

        callback({ id: producer.id });
      } catch (err: any) {
        logger.error(`[${socket.id}] Produce error:`, err.message);
        callback({ error: err.message });
      }
    }
  );

  socket.on(
    "join-meeting",
    async (
      { meetingId, userId }: { meetingId: string; userId: string },
      callback: (response: { error?: string; producers?: any[] }) => void
    ) => {
      // console.log("Im join meeting event listener", { meetingId, userId });
      try {
        const resources = routerResources.get(meetingId);
        if (!resources) {
          return callback({ error: "Router (meeting) not found" });
        }

        socket.meetingId = meetingId;
        socket.userId = userId;

        socket.join(meetingId);
        const prevProducers = Array.from(resources.producers)
          .map((producer) => ({
            id: producer.id,
            kind: producer.kind,
            userId: producer.appData.userId,
          }))
          .filter((entry) => entry.userId !== userId);

        const Producers = Array.from(resources.producers).map((producer) => ({
          id: producer.id,
          kind: producer.kind,
          userId: producer.appData.userId,
        }));

        socket.to(meetingId).emit("new-participant", {
          userId,
          socketId: socket.id,
          producers: Producers, // try testing here
        });

        callback({ producers: Producers });
      } catch (err: any) {
        console.error(`join-meeting error:`, err);
        callback({ error: err.message });
      }
    }
  );

  socket.on(
    "consume",
    async (
      { transportId, producerId, rtpCapabilities, userId, meetingId },
      callback: (response: {
        error?: string;
        id?: string;
        producerId?: string;
        kind?: MediaKind;
        rtpParameters?: RtpParameters;
      }) => void
    ) => {
      console.log(
        `[${socket.id}] consume request from user ${userId} in meeting ${meetingId}`
      );

      try {
        const transport = transports.get(transportId);
        if (!transport) throw new Error("Transport not found");

        const producer = producers.get(producerId);
        if (!producer) throw new Error("Producer not found");

        const resources = routerResources.get(meetingId);
        if (!resources) {
          throw new Error(
            "failed to find the router resources for this meetingid " +
              meetingId
          );
        }
        const router = resources.router;
        if (!router) throw new Error("Router not found for meeting");

        if (!router.canConsume({ producerId, rtpCapabilities })) {
          throw new Error(
            "Cannot consume this producer with given RTP capabilities"
          );
        }

        const consumer = await transport.consume({
          producerId,
          rtpCapabilities,
          paused: false,
          appData: { userId, meetingId },
        });

        if (!socket.consumers) {
          socket.consumers = new Set();
        }
        socket.consumers.add(consumer.id);
        consumers.set(consumer.id, consumer);
        resources.consumers.add(consumer);

        console.log(
          `${socket.id} Consumer created with id ${consumer.id} for producer ${producerId}`
        );

        callback({
          id: consumer.id,
          producerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
        });
      } catch (error: any) {
        console.error(`[${socket.id}] Consume error:`, error.message);
        callback({ error: error.message });
      }
    }
  );

  socket.on("leave-meeting", (data) => {
    console.log(data.name + " has left the meeting " + data.meetingId);
    cleanupPeerResources(socket);
    socket.to(data.meetingId).emit("leave-meeting", {
      name: data.name,
      userId: data.userId,
    });
    // console.log("after user left", routerResources);
  });

  socket.on("disconnect", () => {
    console.log(`Peer disconnected: ${socket.id}`);
    cleanupPeerResources(socket);
  });

  socket.on("terminate-meeting", (data) => {
    socket.to(data.meetingId).emit("terminate-meeting");
    console.log("Meeting has been ended and terminate meeting has initiated");
  });

  socket.on("refresh-meeting", (data) => {
    console.log("hey im refreshser");
    socket.to(data.spaceId).emit("refresh-meeting");
    console.log("meeting refreshed for - " + data.spaceId);
  });
}
