import { Router, type Router as ExpressRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { authController } from "./auth.controller.js";
import { authLimiter } from "../middlewares/rateLimiters.js";

const authRouter: ExpressRouter = Router();

authRouter.post("/auth/register", authLimiter, authController.register);
authRouter.post("/auth/login", authLimiter, authController.login);
authRouter.post("/auth/logout", authController.logout);
authRouter.get("/auth/me", requireAuth, authController.me);

authRouter.post("/auth/verify-email", authController.verifyEmail);
authRouter.post(
  "/auth/resend-verification",
  requireAuth,
  authLimiter,
  authController.resendVerification,
);
authRouter.post("/auth/forgot-password", authLimiter, authController.forgotPassword);
authRouter.post("/auth/reset-password", authLimiter, authController.resetPassword);

export default authRouter;
