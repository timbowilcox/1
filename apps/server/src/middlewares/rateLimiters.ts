import rateLimit from "express-rate-limit";

/**
 * Rate limiters. Keyed by client IP (express-rate-limit reads req.ip, which is
 * only trustworthy because app.ts sets `trust proxy`). Tune limits per the
 * deploy environment.
 */

// Broad DoS backstop across the whole API. Generous because the job-status
// poller is chatty; the expensive/sensitive routes have their own strict
// limiters below. Tune against real traffic during load testing.
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// Strict: credential endpoints (brute-force / credential-stuffing defense).
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

// AI generation: each call costs real provider spend, so cap aggressively.
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Generation rate limit exceeded. Please slow down." },
});

// URL scraping / fetch-by-URL: SSRF-adjacent and abusable; keep modest.
export const scrapeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});
