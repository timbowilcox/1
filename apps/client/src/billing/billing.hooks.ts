import { useMutation } from "@tanstack/react-query";
import { createCheckoutApi, type PlanTier } from "./billing.api";

/**
 * Starts Stripe Checkout (or opens the Billing Portal for existing
 * subscribers) and redirects the browser to the returned URL.
 * A 401 is handled by the axios interceptor (redirect to /login).
 */
export function useCheckout() {
  return useMutation({
    mutationFn: (plan: PlanTier) => createCheckoutApi(plan),
    onSuccess: (data) => {
      if (data?.url) window.location.href = data.url;
    },
  });
}
