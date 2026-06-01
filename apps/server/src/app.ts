import express from "express";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { globalLimiter } from "./middlewares/rateLimiters.js";
import { originCheck, allowedOrigins } from "./middlewares/originCheck.js";
import { logger } from "./lib/logger.js";
import { initSentry } from "./lib/sentry.js";
import urlScraperRouter from "./url-scraper/url-scraper.router.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import billingRouter from "./billing/billing.router.js";
import webhooksRouter from "./webhooks/webhooks.router.js";
import { environment } from "./config/environment.js";
import imagesRouter from "./images/images.router.js";
import aiGenerationRouter from "./ai-generation/ai-generation.router.js";
import authRouter from "./auth/auth.router.js";
import initRedisStore, { redisClient, closeRedis } from "./lib/redis.js";
import { prisma } from "./lib/prisma/index.js";
import { stylesService } from "./styles/styles.service.js";
import promptsRouter from "./styles/styles.router.js";
import projectsRouter from "./projects/projects.router.js";
import collectionsRouter from "./collections/collections.router.js";
import usersRouter from "./users/users.router.js";
import quotaRouter from "./quota/quota.router.js";

(async () => {
  const PORT = environment.PORT;
  initSentry();
  const app = express();

  // Trust the PaaS proxy so req.ip (rate limiting, guest identity) and secure
  // cookies behave correctly behind TLS termination.
  app.set("trust proxy", environment.TRUST_PROXY);

  // Health checks — cheap, unauthenticated, before any middleware.
  app.get("/healthz", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.get("/readyz", async (_req, res) => {
    const redisReady =
      environment.NODE_ENV !== "production" || !!redisClient?.isReady;
    let dbReady = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbReady = true;
    } catch {
      dbReady = false;
    }
    const ok = redisReady && dbReady;
    res
      .status(ok ? 200 : 503)
      .json({ status: ok ? "ready" : "not_ready", checks: { redis: redisReady, db: dbReady } });
  });

  const store = await initRedisStore(); // connect Redis or fallback
  await stylesService.loadPrompts(); // load and save prompts

  // Stripe webhook needs the raw body and carries no browser Origin — mount it
  // before json parsing, helmet, cors and the origin/CSRF check.
  app.use("/webhooks", webhooksRouter);

  app.use(helmet());

  app.use(
    cors({
      origin: allowedOrigins(),
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "1mb" }));

  app.use(
    session({
      store,
      secret: environment.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: environment.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        domain: environment.COOKIE_DOMAIN,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    }),
  );

  // Broad rate-limit backstop + CSRF origin check on state-changing requests.
  app.use(globalLimiter);
  app.use(originCheck);

  // Structured request logging (adds a request id; redaction via the logger).
  app.use(pinoHttp({ logger }));

  app.get("/", (_req, res) => {
    res.send("Hello from server");
  });

  app.use("/api", authRouter);
  app.use("/api", imagesRouter);
  app.use("/api", urlScraperRouter);
  app.use("/api", aiGenerationRouter);
  app.use("/api", projectsRouter);
  app.use("/api", collectionsRouter);
  app.use("/api", billingRouter);
  app.use("/api", quotaRouter);
  app.use("/api", promptsRouter);
  app.use("/api", usersRouter);

  app.use(errorMiddleware);

  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });

  // Graceful shutdown: stop accepting connections, then close Redis + DB.
  const shutdown = (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await closeRedis();
      await prisma.$disconnect().catch(() => {});
      process.exit(0);
    });
    // Force-exit if connections don't drain in time.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
})();
