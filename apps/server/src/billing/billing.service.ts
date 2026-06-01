import { environment } from "../config/environment.js";
import { PlanTier } from "@prisma/client";
import { prisma } from "../lib/prisma/index.js";
import { stripe } from "../lib/stripe.js";
import type { UserDTO } from "../users/users.dto.js";
import type { CreateCustomerDTO } from "./billing.dto.js";
import { CreateCustomerSchema, TIER_TO_PRICE_ID } from "./billing.schemas.js";
import { ApiError, zodParseOrThrow } from "shared";

class BillingService {
  async createCustomer(input: CreateCustomerDTO) {
    const { name, email } = zodParseOrThrow(CreateCustomerSchema, input);
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new ApiError("User not found", 404);

    if (user.stripeCustomerId)
      throw new ApiError("User already have stripe customer", 400);

    const customer = await stripe.customers.create({
      email,
      name,
    });

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        stripeCustomerId: customer.id,
      },
    });

    return {
      customer,
      user: updatedUser,
    };
  }

  async createCheckoutSession(user: UserDTO, plan: PlanTier) {
    if (!user || !user.stripeCustomerId)
      throw new ApiError("Stripe customer id is required", 400);

    const priceId = TIER_TO_PRICE_ID[plan];
    if (!priceId) throw new ApiError(`Price not found by plan ${plan}`);

    const active = await this.getActiveSubscription(user.stripeCustomerId);

    // ===== NO SUBSCRIPTION → CREATE =====
    if (!active) {
      const session = await stripe.checkout.sessions.create({
        customer: user.stripeCustomerId,
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: {
          userId: user.id,
        },
        subscription_data: {
          metadata: {
            userId: user.id,
          },
        },
        success_url: environment.CLIENT_URL,
        cancel_url: environment.CLIENT_URL,
      });

      return { type: "checkout", url: session.url };
    }

    // // ===== ALREADY SUBSCRIBED =====
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: environment.CLIENT_URL,
      // Use the explicit portal config if provided, else Stripe's account default.
      ...(environment.STRIPE_PORTAL_CONFIGURATION
        ? { configuration: environment.STRIPE_PORTAL_CONFIGURATION }
        : {}),
    });

    return { type: "portal", url: session.url };
  }

  async getActiveSubscription(stripeCustomerId: string) {
    const list = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      limit: 10,
    });

    return (
      list.data.find((sub) =>
        ["active", "trialing", "past_due"].includes(sub.status),
      ) ?? null
    );
  }
}

export const billingService = new BillingService();
