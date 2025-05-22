import * as mediasoup from "mediasoup";
import type { RtpCodecCapability } from "mediasoup/node/lib/rtpParametersTypes";
import type {
  Worker,
  Router,
  WebRtcTransport,
  Transport,
} from "mediasoup/node/lib/types";
import { Producer, Consumer } from "mediasoup/node/lib/types";

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
  console.log("✅ Mediasoup Worker created");

  return worker;
}

export async function createRouter(meetingId: string): Promise<Router> {
  if (!worker) {
    throw new Error("❌ Mediasoup worker has not been created yet");
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

  console.log(`✅ Router created for meeting: ${meetingId}`);
  return router;
}

export async function createWebRtcTransport(
  meetingId: string,
  userId: string,
  type: "send" | "recv"
): Promise<WebRtcTransport> {
  const resources = routerResources.get(meetingId);
  if (!resources) {
    throw new Error(`❌ Router not found for meeting: ${meetingId}`);
  }

  const transport = await resources.router.createWebRtcTransport({
    listenIps: [{ ip: "0.0.0.0", announcedIp: "192.168.10.8" }],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    appData: { userId, type },
  });

  resources.transports.add(transport);

  transports.set(transport.id, transport);

  console.log(
    `✅ WebRTC Transport created for meeting: ${meetingId}, transportId: ${transport.id}`
  );

  return transport;
}

export function removeRouter(meetingId: string): void {
  const resources = routerResources.get(meetingId);

  if (!resources) {
    console.warn(`⚠️ No router found for meeting: ${meetingId}`);
    return;
  }

  // Close all consumers
  resources.consumers.forEach((consumer) => {
    try {
      consumer.close();
    } catch (err) {
      console.error(`❌ Error closing consumer: ${err}`);
    }
  });

  // Close all producers
  resources.producers.forEach((producer) => {
    try {
      producer.close();
    } catch (err) {
      console.error(`❌ Error closing producer: ${err}`);
    }
  });

  // Close all transports
  resources.transports.forEach((transport) => {
    try {
      transport.close();
    } catch (err) {
      console.error(`❌ Error closing transport: ${err}`);
    }
  });

  // Close the router itself
  try {
    resources.router.close();
  } catch (err) {
    console.error(`❌ Error closing router: ${err}`);
  }

  // Delete from map
  routerResources.delete(meetingId);
  console.log(
    `🧹 Successfully removed router and cleaned resources for meeting: ${meetingId}`
  );
}

export function removeParticipant(
  meetingId: string,
  userId: string,
  name: string
) {
  const resources = routerResources.get(meetingId);

  if (!resources) {
    console.warn(`⚠️ No router found for meeting: ${meetingId}`);
    return;
  }
  const consumers = Array.from(resources.consumers).filter(
    (i) => i.appData.userId === userId
  );
  const producers = Array.from(resources.producers).filter(
    (i) => i.appData.userId === userId
  );

  const tranports = Array.from(resources.producers).filter(
    (i) => i.appData.userId === userId
  );

  const newConsumers = Array.from(resources.consumers).filter(
    (i) => i.appData.userId !== userId
  );
  const newProducers = Array.from(resources.producers).filter(
    (i) => i.appData.userId !== userId
  );

  const newTranports = Array.from(resources.producers).filter(
    (i) => i.appData.userId !== userId
  );
  const newRouterResources = {
    router: resources.router,
    producers: new Set(newProducers),
    consumers: new Set(newConsumers),
    transports: new Set(newTranports) as any,
  };
  routerResources.set(meetingId, newRouterResources);
  consumers.forEach((consumer) => {
    try {
      consumer.close();
    } catch (err) {
      console.error(`❌ Error closing consumer: ${err}`);
    }
  });

  // Close all producers
  producers.forEach((producer) => {
    try {
      producer.close();
    } catch (err) {
      console.error(`❌ Error closing producer: ${err}`);
    }
  });

  // Close all transports
  transports.forEach((transport) => {
    try {
      transport.close();
    } catch (err) {
      console.error(`❌ Error closing transport: ${err}`);
    }
  });

  console.log(
    `cleaned tranport ${tranports.length} , producer ${producers.length} , consumer of the user ${consumers.length}" + name`
  );
}
