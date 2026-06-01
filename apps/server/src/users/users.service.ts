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

  // GDPR account deletion: remove the user's stored images, then the DB row
  // (cascade removes projects, images, collections, subscriptions, usage, tokens).
  async deleteAccount(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        avatarUrl: true,
        projects: {
          select: {
            originalImages: {
              select: {
                originalPath: true,
                styledImages: { select: { restyledPath: true } },
              },
            },
          },
        },
      },
    });
    if (!user) return;

    const paths: string[] = [];
    for (const project of user.projects) {
      for (const img of project.originalImages) {
        paths.push(img.originalPath);
        for (const styled of img.styledImages) paths.push(styled.restyledPath);
      }
    }
    if (user.avatarUrl && !user.avatarUrl.startsWith("http")) {
      paths.push(user.avatarUrl);
    }

    if (paths.length > 0) {
      // Best-effort — don't block account deletion on storage errors.
      try {
        await imagesService.deleteImages(paths);
      } catch (err) {
        console.error("Storage cleanup during account deletion failed:", err);
      }
    }

    await prisma.user.delete({ where: { id: userId } });
  }
}

export const usersService = new UsersService();