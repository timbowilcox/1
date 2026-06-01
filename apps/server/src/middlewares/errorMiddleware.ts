import type { Request, Response, NextFunction } from "express";
import { ApiError } from "shared";
import { environment } from "../config/environment.js";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Full detail is logged server-side only.
  console.error(err);

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
