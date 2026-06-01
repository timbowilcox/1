import * as Sentry from "@sentry/node";
import { environment } from "../config/environment.js";
import { logger } from "./logger.js";

let enabled = false;

// Initialize error tracking only when a DSN is configured (no-op otherwise).
export function initSentry() {
  if (!environment.SENTRY_DSN) return;
  Sentry.init({
    dsn: environment.SENTRY_DSN,
    environment: environment.NODE_ENV,
    tracesSampleRate: 0, // errors only — no performance tracing
  });
  enabled = true;
  logger.info("Sentry initialized");
}

export function captureException(err: unknown) {
  if (enabled) Sentry.captureException(err);
}
