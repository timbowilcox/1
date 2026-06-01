import { v4 as uuidv4 } from "uuid";
import { redisClient } from "../lib/redis.js";
import type { Job, UpdateJob } from "shared";

const JOB_TTL_SECONDS = 60 * 60 * 24; // 24h

function jobKey(id: string) {
  return `job:${id}`;
}

// In-memory fallback when Redis is unavailable
const memStore = new Map<string, string>();

async function storeGet(key: string): Promise<string | null> {
  const client = redisClient;
  if (client?.isReady) return client.get(key);
  return memStore.get(key) ?? null;
}

async function storeSet(key: string, value: string): Promise<void> {
  const client = redisClient;
  if (client?.isReady) {
    await client.set(key, value, { EX: JOB_TTL_SECONDS });
  } else {
    memStore.set(key, value);
  }
}

async function storeTtl(key: string): Promise<number> {
  const client = redisClient;
  if (client?.isReady) return client.ttl(key);
  return JOB_TTL_SECONDS;
}

async function storeSetWithTtl(key: string, value: string, ttl: number): Promise<void> {
  const client = redisClient;
  if (client?.isReady) {
    await client.set(key, value, { EX: ttl > 0 ? ttl : JOB_TTL_SECONDS });
  } else {
    memStore.set(key, value);
  }
}

class JobService {
  async createJob(input: unknown, owner?: string): Promise<string> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const job: Job = {
      id,
      status: "pending",
      owner,
      input,
      createdAt: now,
      updatedAt: now,
    };

    await storeSet(jobKey(id), JSON.stringify(job));

    return id;
  }

  async getJob(id: string): Promise<Job | null> {
    const data = await storeGet(jobKey(id));
    if (!data) return null;
    return JSON.parse(data);
  }

  async updateJob(id: string, newValues: UpdateJob): Promise<void> {
    const key = jobKey(id);
    const data = await storeGet(key);
    if (!data) throw new Error("Job not found");

    const job: Job = JSON.parse(data);

    const updated: Job = {
      ...job,
      ...newValues,
      updatedAt: new Date().toISOString(),
    };

    const ttl = await storeTtl(key);
    await storeSetWithTtl(key, JSON.stringify(updated), ttl);
  }

  async completeJob<T>(id: string, result: T): Promise<void> {
    const key = jobKey(id);
    const data = await storeGet(key);
    if (!data) throw new Error("Job not found");

    const job: Job = JSON.parse(data);

    const updated: Job = {
      ...job,
      status: "completed",
      result,
      updatedAt: new Date().toISOString(),
    };

    const ttl = await storeTtl(key);
    await storeSetWithTtl(key, JSON.stringify(updated), ttl);
  }

  async failJob(id: string, error: string): Promise<void> {
    const key = jobKey(id);
    const data = await storeGet(key);
    if (!data) throw new Error("Job not found");

    const job: Job = JSON.parse(data);

    const updated: Job = {
      ...job,
      status: "failed",
      error,
      updatedAt: new Date().toISOString(),
    };

    const ttl = await storeTtl(key);
    await storeSetWithTtl(key, JSON.stringify(updated), ttl);
  }
}

export const jobService = new JobService();
