import { Router } from "express";
import { usersController } from "./users.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const usersRouter: Router = Router();

usersRouter.patch("/users/avatar", requireAuth, usersController.updateAvatar);
usersRouter.delete("/users/me", requireAuth, usersController.deleteAccount);

export default usersRouter;
