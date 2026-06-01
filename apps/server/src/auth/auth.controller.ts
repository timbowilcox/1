import type { Request, Response } from "express";
import { authService } from "./auth.service.js";
import { usersService } from "../users/users.service.js";
import mapUser from "../utils/mapUser.util.js";
import { quotaService } from "../quota/quota.service.js";

// Regenerate the session on authentication (prevents session fixation), while
// preserving any guest-owned paths so a guest's just-uploaded images stay
// accessible after signing up.
function regenerateSession(req: any, userId: string): Promise<void> {
  const ownedPaths = req.session.ownedPaths;
  return new Promise((resolve, reject) => {
    req.session.regenerate((err: unknown) => {
      if (err) return reject(err);
      req.session.userId = userId;
      if (ownedPaths) req.session.ownedPaths = ownedPaths;
      req.session.save((saveErr: unknown) => (saveErr ? reject(saveErr) : resolve()));
    });
  });
}

class AuthController {
  register = async (req: any, res: Response) => {
    const user = await authService.register(req.body);
    await regenerateSession(req, user.id);

    const ip: string = req.ip || "unknown_ip";
    const migratedCount = await quotaService.migrateGuestQuotaToUser(ip, user.id);

    if (migratedCount === 0) {
      await quotaService.createFreePeriod({ type: "user", id: user.id });
    }

    const fullUser = await usersService.getUserById(user.id);

    res.json(mapUser(fullUser));
  };

  login = async (req: any, res: Response) => {
    const user = await authService.login(req.body);
    await regenerateSession(req, user.id);
    const fullUser = await usersService.getUserById(user.id);
    res.json(mapUser(fullUser));
  };

  logout = (req: Request, res: Response) => {
    req.session.destroy((err: any) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.clearCookie("connect.sid");
      res.status(200).end();
    });
  };

  me = async (req: any, res: any) => {
    const user = await usersService.getUserById(req.session.userId);
    res.json(mapUser(user));
  };
}

export const authController = new AuthController();
