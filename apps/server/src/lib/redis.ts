import { createClient, type RedisClientType } from "redis";
import { RedisStore } from "connect-redis";
import session from "express-session";
import { environment } from "../config/environment.js";

let redisStore: RedisStore | session.MemoryStore; // Store for express-session
export let redisClient: RedisClientType | undefined;

// connect-redis `ttl` is in SECONDS (the previous value was in ms → ~19 years).
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

function redisUrl(): string {
  if (environment.REDIS_URL) return environment.REDIS_URL;
  return `redis://${environment.REDIS_HOST}:${environment.REDIS_PORT}`;
}

export default async function initRedisStore() {
  try {
    redisClient = createClient({
      url: redisUrl(),
      socket: {
        // Give up after a bounded number of attempts so prod fails fast at boot
        // rather than hanging forever on an unreachable Redis.
        reconnectStrategy: (retries) =>
          retries > 10 ? new Error("Redis unavailable") : Math.min(retries * 200, 3000),
      },
    });

    // Keep transient post-connect errors from crashing the process.
    redisClient.on("error", (err) => console.error("Redis error:", err.message));
    redisClient.on("connect", () => console.log("Redis client connected"));

    await redisClient.connect();

    redisStore = new RedisStore({ client: redisClient, ttl: SESSION_TTL_SECONDS });
    console.log("Using Redis session store");
    return redisStore;
  } catch (err) {
    // In production, NEVER silently degrade to an in-memory session store
    // (loses sessions on restart, can't scale across instances). Fail fast so
    // the platform restarts/alerts.
    if (environment.NODE_ENV === "production") {
      console.error("FATAL: Redis is required in production but is unavailable.");
      throw err;
    }

    console.error("Redis unavailable, falling back to MemoryStore (development only)");
    console.error("Redis error:", err);
    redisClient = undefined;
    redisStore = new session.MemoryStore();
    console.log("Using MemoryStore session store");
    return redisStore;
  }
}

export async function closeRedis() {
  if (redisClient?.isReady) {
    await redisClient.quit().catch(() => {});
  }
}
