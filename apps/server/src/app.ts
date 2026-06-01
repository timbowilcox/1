import express from "express";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import { globalLimiter } from "./middlewares/rateLimiters.js";
import { originCheck } from "./middlewares/originCheck.js";
import urlScraperRouter from "./url-scraper/url-scraper.router.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import billingRouter from "./billing/billing.router.js";
import webhooksRouter from "./webhooks/webhooks.router.js";
import { environment } from "./config/environment.js";
import imagesRouter from "./images/images.router.js";
import aiGenerationRouter from "./ai-generation/ai-generation.router.js";
import authRouter from "./auth/auth.router.js";
import initRedisStore from "./lib/redis.js";
import { stylesService } from "./styles/styles.service.js";
import promptsRouter from "./styles/styles.router.js";
import projectsRouter from "./projects/projects.router.js";
import collectionsRouter from "./collections/collections.router.js";
import usersRouter from "./users/users.router.js";
import quotaRouter from "./quota/quota.router.js";

(async () => {
  const PORT = environment.PORT;
  const app = express();

  // Trust the PaaS proxy so req.ip (rate limiting, guest identity) and secure
  // cookies behave correctly behind TLS termination.
  app.set("trust proxy", environment.TRUST_PROXY);

  const store = await initRedisStore(); // connect Redis or fallback
  await stylesService.loadPrompts(); // load and save prompts

  // Stripe webhook needs the raw body and carries no browser Origin — mount it
  // before json parsing, helmet, cors and the origin/CSRF check.
  app.use("/webhooks", webhooksRouter);

  app.use(helmet());

  app.use(
    cors({
      origin: environment.CLIENT_URL,
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
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    }),
  );

  // Broad rate-limit backstop + CSRF origin check on state-changing requests.
  app.use(globalLimiter);
  app.use(originCheck);

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

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
