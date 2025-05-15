import { createClient, RedisClientType } from "redis";

let client: RedisClientType;

export const initiateRedisClient = async () => {
  if (!client) {
    client = createClient({
      url: "redis://localhost:6379",
    });

    client.on("error", (err: Error) => {
      console.error("❌ Redis error:", err);
    });

    await client.connect();
  }
  return client;
};
