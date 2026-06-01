import type Stripe from "stripe";
import { environment } from "../config/environment.js";
import { prisma } from "../lib/prisma/index.js";
import { stripe } from "../lib/stripe.js";
import { mapStripeStatus } from "../utils/mapStripeStatus.util.js";
import { PRICE_TO_TIER } from "./billing.schemas.js";
import { quotaService } from "../quota/quota.service.js";
import { BadRequestError } from "../errors/apiErrors.js";
import type { SubscriptionStatus } from "@prisma/client";

// Statuses that retain paid access. PAST_DUE is included to give a grace
// window while Stripe retries the failed payment; access is revoked once the
// subscription transitions to UNPAID / CANCELED (or is deleted).
const PAID_STATUSES = new Set<SubscriptionStatus>(["ACTIVE", "TRIALING", "PAST_DUE"]);

class BillingWebhooks {
  async webhookHandler(payload: string | Buffer, header: string | string[]) {
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        header,
        environment.STRIPE_WEBHOOK_SECRET,
      );
    } catch {
      // Invalid signature → 400 so Stripe does not retry forever.
      throw new BadRequestError("Invalid Stripe webhook signature");
    }

    // Idempotency: process each event id once. Record before processing and
    // roll back the marker on failure so Stripe's retry can reprocess.
    try {
      await prisma.webhookEvent.create({
        data: { id: event.id, type: event.type },
      });
    } catch (err: any) {
      if (err?.code === "P2002") {
        console.log("Duplicate Stripe event ignored:", event.id);
        return;
      }
      throw err;
    }

    try {
      await this.dispatch(event);
    } catch (err) {
      await prisma.webhookEvent
        .delete({ where: { id: event.id } })
        .catch(() => {});
      throw err;
    }
  }

  private async dispatch(event: Stripe.Event) {
    console.log("Stripe event:", event.type, event.id);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode === "subscription" && session.subscription) {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subId, {
            expand: ["items.data.price"],
          });
          await this.syncSubscription(subscription);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await this.syncSubscription(event.data.object);
        break;

      case "invoice.paid":
      case "invoice.payment_failed":
        await this.handleInvoiceEvent(event.data.object);
        break;
    }
  }

  /** metadata.userId (set at checkout) → fallback to Stripe customer id lookup. */
  private async resolveUserId(
    subscription: Stripe.Subscription,
  ): Promise<string | null> {
    const metaUserId = subscription.metadata?.userId;
    if (metaUserId) {
      const user = await prisma.user.findUnique({
        where: { id: metaUserId },
        select: { id: true },
      });
      if (user) return user.id;
    }

    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id;
    if (customerId) {
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
        select: { id: true },
      });
      if (user) return user.id;
    }

    return null;
  }

  /**
   * Single source of truth: reconcile the DB Subscription + quota to the
   * current Stripe subscription state. Idempotent (upsert by subscription id),
   * so redelivered / overlapping events converge rather than corrupt state.
   */
  private async syncSubscription(subscription: Stripe.Subscription) {
    const item = subscription.items.data[0];
    if (!item) {
      console.error(`Item not found from subscription ${subscription.id}`);
      return;
    }

    const planTier = PRICE_TO_TIER[item.price.id];
    if (!planTier) {
      console.error("Unknown plan tier for price", item.price.id);
      return;
    }

    const userId = await this.resolveUserId(subscription);
    if (!userId) {
      console.error("No user found for subscription", subscription.id);
      return;
    }

    const status = mapStripeStatus(subscription.status);
    const currentPeriodStart = new Date(item.current_period_start * 1000);
    const currentPeriodEnd = new Date(item.current_period_end * 1000);

    await prisma.subscription.upsert({
      where: { stripeSubscriptionId: subscription.id },
      create: {
        userId,
        stripeSubscriptionId: subscription.id,
        planTier,
        status,
        currentPeriodStart,
        currentPeriodEnd,
      },
      update: { planTier, status, currentPeriodStart, currentPeriodEnd },
    });

    const identity = { type: "user", id: userId } as const;

    if (PAID_STATUSES.has(status)) {
      await quotaService.upsertPeriod(identity, {
        periodStart: currentPeriodStart,
        periodEnd: currentPeriodEnd,
        imagesLimit: quotaService.getImagesLimitByPlan(planTier),
      });
    } else {
      // CANCELED / UNPAID / INCOMPLETE(_EXPIRED) / PAUSED → revoke paid quota.
      await quotaService.downgradeToFree(identity);
    }
  }

  private async handleInvoiceEvent(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.parent?.subscription_details
      ?.subscription as string | undefined;
    if (!subscriptionId) {
      console.log("Invoice event without subscription");
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["items.data.price"],
    });

    await this.syncSubscription(subscription);
  }
}

export const billingWebhooks = new BillingWebhooks();
