import { Router, type Router as ExpressRouter } from "express";
import { aiGenerationController } from "./ai-generation.controller.js";
import { sessionUser } from "../middlewares/sessionUser.js";
import { aiLimiter } from "../middlewares/rateLimiters.js";

const aiGenerationRouter: ExpressRouter = Router();

aiGenerationRouter.post(
  "/restyle",
  aiLimiter,
  sessionUser,
  aiGenerationController.restyle,
);
// Job reads are owner-scoped in the controller via the session (ownerKey).
aiGenerationRouter.get("/restyle/jobs", aiGenerationController.getJobs);
aiGenerationRouter.get("/restyle/:jobId", aiGenerationController.getJobById);

export default aiGenerationRouter;
