import ms from "ms";
import { PRICE_TO_TIER } from "../billing/billing.schemas.js";
import { billingService } from "../billing/billing.service.js";
import { environment } from "../config/environment.js";
import {
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} from "../errors/apiErrors.js";
import { type PlanTier, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma/index.js";
import { mapStripeStatus } from "../utils/mapStripeStatus.util.js";
import type { QuotaPeriodCreateDTO } from "./quota.dto.js";
import type { RequestIdentity } from "../types/index.js";

class QuotaService {
  async upsertPeriod(identity: RequestIdentity, input: QuotaPeriodCreateDTO) {
    const usage = await this.getLastUsagePeriod(identity);

    const dataToSave: Prisma.UsageTrackingUncheckedCreateInput = {
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      imagesLimit: input.imagesLimit,
      userId: identity.type === "user" ? identity.id : null,
      guestId: identity.type === "guest" ? identity.id : null,
    };

    if (!usage) {
      return prisma.usageTracking.create({
        data: dataToSave,
      });
    }

    return prisma.usageTracking.update({
      where: { id: usage.id },
      data: input,
    });
  }

  async createFreePeriod(identity: RequestIdentity) {
    const freeTime = ms(environment.FREE_PERIOD);
    const periodStart = new Date();
    const periodEnd = new Date(periodStart.getTime() + freeTime);

    console.log(`CREATE FREE PERIOD FOR ${identity.type.toUpperCase()}: ${identity.id}`);

    return this.upsertPeriod(identity, {
      periodStart,
      periodEnd,
      imagesLimit: this.getImagesLimitByPlan("FREE"),
    });
  }

  async assertQuotaAvailable(identity: RequestIdentity, count: number) {
    let usage = await this.getLastUsagePeriod(identity);

    if (!usage && identity.type === "user") {
      console.log("Quota missing for user → repairing from Stripe...");
      try {
        await this.repairQuotaFromStripe(identity.id);
        usage = await this.getLastUsagePeriod(identity);
      } catch (err) {
        console.error("Failed to repair quota from Stripe:", err);
      }
    }

    // ===== FALLBACK FREE PERIOD =====
    if (!usage) usage = await this.createFreePeriod(identity);

    if (usage.imagesUsed + count > usage.imagesLimit)
      throw new ForbiddenError(
        `Quota exceeded. Available ${usage.imagesLimit - usage.imagesUsed}`,
      );

    return usage;
  }

  async reserveQuotaAtomic(identity: RequestIdentity, count: number) {
    const usage = await this.assertQuotaAvailable(identity, count);

    // Atomic reservation: only increment if doing so stays within the limit.
    // Concurrent requests are serialized by the DB — a racing request that
    // would exceed the limit matches 0 rows and is rejected. (The prior
    // read-then-write here was not actually atomic and could over-spend.)
    const reserved = await prisma.usageTracking.updateMany({
      where: {
        id: usage.id,
        imagesUsed: { lte: usage.imagesLimit - count },
      },
      data: {
        imagesUsed: { increment: count },
      },
    });

    if (reserved.count === 0) {
      throw new ForbiddenError(
        `Quota exceeded. Available ${Math.max(0, usage.imagesLimit - usage.imagesUsed)}`,
      );
    }

    return usage;
  }

  async refundQuota(id: string, count: number) {
    await prisma.usageTracking.update({
      where: { id },
      data: {
        imagesUsed: { decrement: count },
      },
    });
  }

  /**
   * Revoke paid quota — drop the caller's current period limit back to FREE.
   * Called when a subscription is canceled / unpaid / deleted so a lapsed
   * subscriber can't keep spending paid quota for the rest of the period.
   * imagesUsed is left as-is (they may now be over the free cap until renewal).
   */
  async downgradeToFree(identity: RequestIdentity) {
    const usage = await this.getLastUsagePeriod(identity);
    if (!usage) return;

    await prisma.usageTracking.update({
      where: { id: usage.id },
      data: { imagesLimit: this.getImagesLimitByPlan("FREE") },
    });
  }

  async getLastUsagePeriod(identity: RequestIdentity) {
    const now = new Date();
    
    const targetField =
      identity.type === "user"
        ? { userId: identity.id }
        : { guestId: identity.id };

    return prisma.usageTracking.findFirst({
      where: {
        ...targetField,
        periodStart: { lte: now },
        periodEnd: { gte: now },
      },
      orderBy: {
        periodEnd: 'desc'
      }
    });
  }

  async migrateGuestQuotaToUser(guestId: string, userId: string): Promise<number> {
    const result = await prisma.usageTracking.updateMany({
      where: {
        guestId: guestId,
        userId: null,
      },
      data: {
        userId: userId,
        guestId: null,
      },
    });

    if (result.count > 0) {
      // Don't log the raw guest IP (PII).
      console.log(`Migrated ${result.count} guest quota period(s) to user ${userId}`);
    }

    return result.count;
  }

  async repairQuotaFromStripe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundError("User not found");
    if (!user.stripeCustomerId)
      throw new BadRequestError("User haven't stripe customer id");

    const subscription = await billingService.getActiveSubscription(
      user.stripeCustomerId,
    );
    if (!subscription) throw new Error("Subscription not found");

    const item = subscription.items.data[0];
    if (!item) throw new Error("Subscription item not found");

    const planTier = PRICE_TO_TIER[item.price.id];
    if (!planTier) throw new Error("Unknown plan tier");

    const periodStart = new Date(item.current_period_start * 1000);
    const periodEnd = new Date(item.current_period_end * 1000);

    await prisma.subscription.upsert({
      where: { stripeSubscriptionId: subscription.id },
      create: {
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        planTier,
        status: mapStripeStatus(subscription.status),
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
      update: {
        planTier,
        status: mapStripeStatus(subscription.status),
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
    });

    const imagesLimit = this.getImagesLimitByPlan(planTier);

    const usage = await this.upsertPeriod({ type: "user", id: userId }, {
      periodStart,
      periodEnd,
      imagesLimit,
    });

    console.log("Quota repaired from Stripe", {
      userId,
      periodStart,
      periodEnd,
    });

    return usage;
  }

  getImagesLimitByPlan(plan: PlanTier | "FREE") {
    return PLAN_LIMITS[plan];
  }
}

export const quotaService = new QuotaService();

export const PLAN_LIMITS = {
  FREE: environment.PLAN_LIMIT_FREE,
  PRO: environment.PLAN_LIMIT_PRO,
  PRO_PLUS: environment.PLAN_LIMIT_PRO_PLUS,
};
