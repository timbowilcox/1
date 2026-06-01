import type { Request, Response } from "express";
import { usersService } from "./users.service.js";
import mapUser from "../utils/mapUser.util.js";

class UsersController {
  updateAvatar = async (req: any, res: Response) => {
    try {
      const { avatarPath } = req.body;
      
      if (!avatarPath) {
        return res.status(400).json({ message: "Avatar path is required" });
      }

      await usersService.updateAvatar(req.session.userId, avatarPath);
      const updatedUser = await usersService.getUserById(req.session.userId);
      
      res.status(200).json(mapUser(updatedUser));
    } catch (error) {
      res.status(500).json({ message: "Failed to update avatar" });
    }
  };

  deleteAccount = async (req: any, res: Response) => {
    const userId = req.session.userId;
    await usersService.deleteAccount(userId);
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.status(204).end();
    });
  };
}

export const usersController = new UsersController();