import pino from "pino";
import { environment } from "../config/environment.js";

// Structured logger with redaction so secrets / PII never reach the logs even
// if an object carrying them is logged.
export const logger = pino({
  level: environment.NODE_ENV === "production" ? "info" : "debug",
  redact: {
    paths: [
      "req.headers.cookie",
      "req.headers.authorization",
      'req.headers["x-forwarded-for"]',
      "*.password",
      "*.passwordHash",
      "*.token",
      "*.tokenHash",
      "*.SESSION_SECRET",
      "*.SUPABASE_SERVICE_ROLE_KEY",
      "*.STRIPE_SECRET_KEY",
    ],
    censor: "[redacted]",
  },
});
