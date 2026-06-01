import { prisma } from "../lib/prisma/index.js";
import { imagesService } from "../images/images.service.js";

class UsersService {
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        stripeCustomerId: true,
        createdAt: true,
        avatarUrl: true,
        emailVerified: true,
        usageTracking: {
          orderBy: { periodEnd: "desc" },
          take: 1,
        },
      },
    });

    if (!user) return null;

    let creditsRemaining = 0;
    if (user.usageTracking.length > 0) {
      const tracking = user.usageTracking[0];
      if (tracking) {
        creditsRemaining = Math.max(0, tracking.imagesLimit - tracking.imagesUsed);
      }
    }

    let fullAvatarUrl = null;
    if (user.avatarUrl) {
      if (user.avatarUrl.startsWith("http")) {
        fullAvatarUrl = user.avatarUrl;
      } else {
        fullAvatarUrl = imagesService.getPublicUrl(user.avatarUrl);
      }
    }

    return {
      ...user,
      avatarUrl: fullAvatarUrl,
      creditsRemaining,
    };
  }

  async updateAvatar(id: string, avatarPath: string) {
    return prisma.user.update({
      where: { id },
      data: { avatarUrl: avatarPath },
    });
  }
}

export const usersService = new UsersService();