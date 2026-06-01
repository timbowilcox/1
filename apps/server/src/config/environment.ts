import "dotenv/config";
import { z } from "zod";
import ms, { type StringValue } from "ms";

/**
 * Runtime env validation.
 * App MUST crash on startup if config is invalid.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().default(4000),
  USE_MOCK_AI: z
    .string()
    .optional()
    .default("false")
    .transform((val) => val.toLowerCase() === "true"),
  SESSION_SECRET: z
    .string()
    .min(1, "SESSION_SECRET is required")
    .refine(
      (v) =>
        process.env.NODE_ENV !== "production" ||
        (v.length >= 32 && v !== "secret_key"),
      "SESSION_SECRET must be a strong secret (>= 32 chars) in production",
    ),
  // Number of trusted proxy hops in front of the app (PaaS load balancers).
  // Required for correct req.ip (rate limiting, guest identity) and secure
  // cookies behind TLS termination.
  TRUST_PROXY: z.coerce.number().default(1),
  DATABASE_URL: z.string(),
  CLIENT_URL: z.url(),
  // Optional: share the session cookie across subdomains of one root domain
  // (e.g. ".yourdomain.com" for app.* + api.*). Unset = host-only cookie.
  COOKIE_DOMAIN: z.string().optional(),

  PLAN_LIMIT_FREE: z.coerce.number().min(0),
  PLAN_LIMIT_PRO: z.coerce.number().min(0),
  PLAN_LIMIT_PRO_PLUS: z.coerce.number().min(0),
  // Rolling free-quota window (renewed lazily on expiry). Must be a real
  // cadence — the old "1m" default was 1 MINUTE, which expired mid-session.
  FREE_PERIOD: z
    .custom<StringValue>()
    .default("30d")
    .refine((v) => typeof ms(v) === "number", {
      message: "Invalid duration format",
    }),

  GEMINI_API_KEY: z.string(),
  OPENAI_API_KEY: z.string(),
  SD_API_KEY: z.string(),

  GEMINI_MODEL: z.string(),

  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  STRIPE_PRICE_ID_PRO: z.string(),
  STRIPE_PRICE_ID_PRO_PLUS: z.string(),
  STRIPE_PORTAL_CONFIGURATION: z.string(),

  SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SUPABASE_BUCKET_NAME: z.string(),

  // Prefer a full connection URL (managed Redis, supports rediss:// + auth).
  // Falls back to REDIS_HOST/REDIS_PORT for local dev.
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
});

export const environment = envSchema.parse(process.env);