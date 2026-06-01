import type { Request } from "express";

/**
 * Stable ownership key for transient resources (restyle jobs and their image
 * results). Authenticated users are keyed by user id; guests are keyed by their
 * (signed, httpOnly) session id — far stronger than a spoofable client IP, and
 * it requires no login. Used to scope job reads / signed-URL generation so one
 * caller can't read another's job by id (IDOR).
 */
export function ownerKey(req: Request): string {
  if (req.session.userId) return `user:${req.session.userId}`;
  return `guest:${req.sessionID}`;
}
