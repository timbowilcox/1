import api from "@/lib/api";

export type PlanTier = "PRO" | "PRO_PLUS";

// Returns a Stripe Checkout URL (new subscription) or Billing Portal URL
// (existing subscriber). 204 → no url (caller stays put).
export const createCheckoutApi = async (
  plan: PlanTier,
): Promise<{ url: string | null }> => {
  const res = await api.post("/api/checkout", { plan });
  return res.data ?? { url: null };
};
