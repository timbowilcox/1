import { Router, type Router as ExpressRouter } from "express";
import { quotaService } from "./quota.service.js";
import { sessionUser } from "../middlewares/sessionUser.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const quotaRouter: ExpressRouter = Router();

quotaRouter.get("/usage", requireAuth, sessionUser, async (req: any, res) => {
  let usage = await quotaService.getLastUsagePeriod({ type: "user", id: req.user.id });
  if (!usage) usage = await quotaService.repairQuotaFromStripe(req.user.id);
  res.json(usage);
});

export default quotaRouter;
