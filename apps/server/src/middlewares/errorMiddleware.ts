import type { Request, Response, NextFunction } from "express";
import { ApiError } from "shared";
import { environment } from "../config/environment.js";
import { logger } from "../lib/logger.js";
import { captureException } from "../lib/sentry.js";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Unexpected (non-ApiError) failures are logged + sent to error tracking.
  if (!(err instanceof ApiError)) {
    logger.error({ err }, "Unhandled error");
    captureException(err);
  }

  if (err instanceof ApiError) {
    return res
      .status(err.status || 500)
      .json({ message: err.message, code: err.code });
  }

  // Never echo raw internal error messages (DB/driver internals, paths,
  // secrets) to clients in production.
  const message =
    environment.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Internal server error";

  res.status(500).json({ message });
}
