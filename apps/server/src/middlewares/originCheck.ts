import type { Request, Response, NextFunction } from "express";
import { environment } from "../config/environment.js";
import { ForbiddenError } from "../errors/apiErrors.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

let cached: string[] | null = null;

/**
 * Browser origins allowed for CORS + the CSRF origin check. From ALLOWED_ORIGINS
 * (comma-separated) if set, else [CLIENT_URL]. Normalised to bare origins.
 */
export function allowedOrigins(): string[] {
  if (!cached) {
    const raw = environment.ALLOWED_ORIGINS
      ? environment.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
      : [environment.CLIENT_URL];
    cached = raw.map((u) => new URL(u).origin);
  }
  return cached;
}

/**
 * CSRF defense for a cookie-session API: state-changing requests must carry an
 * Origin (or Referer) matching one of the allowed origins. Browsers always
 * attach Origin to cross-site state-changing fetches and it can't be spoofed by
 * page JS, so this blocks classic forged cross-site requests. Combined with the
 * SameSite cookie attribute this is defense-in-depth.
 *
 * Mounted AFTER the Stripe webhook route (signature-verified, no browser Origin)
 * and applies only to unsafe methods.
 */
export function originCheck(req: Request, _res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get("origin");
  let source: string | null = origin ?? null;

  if (!source) {
    const referer = req.get("referer");
    if (referer) {
      try {
        source = new URL(referer).origin;
      } catch {
        source = null;
      }
    }
  }

  if (!source || !allowedOrigins().includes(source)) {
    return next(new ForbiddenError("Cross-origin request blocked"));
  }

  next();
}
