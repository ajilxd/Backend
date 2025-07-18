import * as mediasoup from "mediasoup";
import type { RtpCodecCapability } from "mediasoup/node/lib/rtpParametersTypes";
import type {
  Worker,
  Router,
  WebRtcTransport,
  Transport,
} from "mediasoup/node/lib/types";
import { Producer, Consumer } from "mediasoup/node/lib/types";
import { logger } from "../utils/logger";

let worker: Worker | null = null;

export const routerResources = new Map<
  string,
  {
    router: Router;
    transports: Set<WebRtcTransport>;
    producers: Set<Producer>;
    consumers: Set<Consumer>;
  }
>();
export const transports = new Map<string, Transport>();

export async function createWorker(): Promise<Worker> {
  if (worker) return worker;
  worker = await mediasoup.createWorker();
  logger.info(" Mediasoup Worker created");

  return worker;
}

export async function createRouter(meetingId: string): Promise<Router> {
  if (!worker) {
    throw new Error("Mediasoup worker has not been created yet");
  }

  const mediaCodecs: RtpCodecCapability[] = [
    {
      kind: "audio",
      mimeType: "audio/opus",
      clockRate: 48000,
      channels: 2,
    },
    {
      kind: "video",
      mimeType: "video/VP8",
      clockRate: 90000,
    },
  ];

  const router = await worker.createRouter({ mediaCodecs });

  routerResources.set(meetingId, {
    router,
    transports: new Set(),
    producers: new Set(),
    consumers: new Set(),
  });

  logger.info(`Router created for meeting: ${meetingId}`);
  return router;
}

export async function createWebRtcTransport(
  meetingId: string,
  userId: string,
  type: "send" | "recv"
): Promise<WebRtcTransport> {
  const resources = routerResources.get(meetingId);
  if (!resources) {
    throw new Error(` Router not found for meeting: ${meetingId}`);
  }

  const transport = await resources.router.createWebRtcTransport({
    listenIps: [{ ip: "127.0.0.1" }],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    appData: { userId, type },
  });

  resources.transports.add(transport);

  transports.set(transport.id, transport);

  logger.info(
    `WebRTC Transport created for meeting: ${meetingId}, transportId: ${transport.id}`
  );

  return transport;
}

export function removeRouter(meetingId: string): void {
  const resources = routerResources.get(meetingId);

  if (!resources) {
    logger.warn(` No router found for meeting: ${meetingId}`);
    return;
  }

  resources.consumers.forEach((consumer) => {
    try {
      consumer.close();
    } catch (err) {
      logger.error(`Error closing consumer: ${err}`);
    }
  });

  resources.producers.forEach((producer) => {
    try {
      producer.close();
    } catch (err) {
      logger.error(` Error closing producer: ${err}`);
    }
  });

  resources.transports.forEach((transport) => {
    try {
      transport.close();
    } catch (err) {
      logger.error(`Error closing transport: ${err}`);
    }
  });

  try {
    resources.router.close();
  } catch (err) {
    logger.error(`Error closing router: ${err}`);
  }

  routerResources.delete(meetingId);
  logger.info(
    `Successfully removed router and cleaned resources for meeting: ${meetingId}`
  );
}

export function removeParticipant(
  meetingId: string,
  userId: string,
  name: string
) {
  const resources = routerResources.get(meetingId);

  if (!resources) {
    logger.warn(` No router found for meeting: ${meetingId}`);
    return;
  }
  const consumers = Array.from(resources.consumers).filter(
    (i) => i.appData.userId === userId
  );
  const producers = Array.from(resources.producers).filter(
    (i) => i.appData.userId === userId
  );

  const transports = Array.from(resources.transports).filter(
    (i) => i.appData.userId === userId
  );

  const newConsumers = Array.from(resources.consumers).filter(
    (i) => i.appData.userId !== userId
  );
  const newProducers = Array.from(resources.producers).filter(
    (i) => i.appData.userId !== userId
  );

  const newTransports = Array.from(resources.transports).filter(
    (i) => i.appData.userId !== userId
  );

  consumers.forEach((consumer) => {
    try {
      consumer.close();
    } catch (err) {
      console.error(`❌ Error closing consumer: ${err}`);
    }
  });

  producers.forEach((producer) => {
    try {
      producer.close();
    } catch (err) {
      console.error(`❌ Error closing producer: ${err}`);
    }
  });

  transports.forEach((transport) => {
    try {
      transport.close();
    } catch (err) {
      console.error(`❌ Error closing transport: ${err}`);
    }
  });

  const newRouterResources = {
    router: resources.router,
    producers: new Set(newProducers),
    consumers: new Set(newConsumers),
    transports: new Set(newTransports),
  };
  routerResources.set(meetingId, newRouterResources);

  logger.info(
    `cleaned transport ${transports.length} , producer ${producers.length} , consumer of the user ${consumers.length}" + name`
  );
}
