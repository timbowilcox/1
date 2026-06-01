import type { Request, Response } from "express";
import { billingService } from "./billing.service.js";
import { BadRequestError } from "../errors/apiErrors.js";
import { billingWebhooks } from "./billing.webhooks.js";

class BillingController {
  createCheckoutSession = async (req: any, res: Response) => {
    let customerId = req.user.stripeCustomerId as string;
    const plan = req.body.plan;
    if (!plan) throw new BadRequestError("Plan tier is required");

    if (!customerId) {
      const { customer } = await billingService.createCustomer(req.user);
      customerId = customer.id;
      req.user.stripeCustomerId = customer.id;
    }
    const { url } = await billingService.createCheckoutSession(req.user, plan);
    if (url) res.json({ url: url });
    else res.status(204).end();
  };

  webhook = async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"]!;
    // req.body is the raw Buffer (express.raw) — pass it through unmodified so
    // the Stripe signature verifies against the exact bytes received.
    await billingWebhooks.webhookHandler(req.body, sig);
    res.json({ received: true });
  };
}

export const billingController = new BillingController();
