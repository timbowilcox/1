import type { Request, Response, NextFunction } from "express";
import { environment } from "../config/environment.js";
import { ForbiddenError } from "../errors/apiErrors.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

let allowedOrigin: string | null = null;
function getAllowedOrigin(): string {
  if (!allowedOrigin) allowedOrigin = new URL(environment.CLIENT_URL).origin;
  return allowedOrigin;
}

/**
 * CSRF defense for a cookie-session API: state-changing requests must carry an
 * Origin (or Referer) matching the configured client origin. Browsers always
 * attach Origin to cross-site state-changing fetches, and it cannot be spoofed
 * by page JS — so this blocks classic forged cross-site requests. Combined with
 * the SameSite cookie attribute this is defense-in-depth.
 *
 * Mounted AFTER the Stripe webhook route (which is signature-verified and has
 * no browser Origin) and applies only to unsafe methods.
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

  if (!source || source !== getAllowedOrigin()) {
    return next(new ForbiddenError("Cross-origin request blocked"));
  }

  next();
}
