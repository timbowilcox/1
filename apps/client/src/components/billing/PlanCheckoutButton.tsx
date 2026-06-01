"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useCheckout } from "@/billing/billing.hooks";
import type { PlanTier } from "@/billing/billing.api";

interface Props {
  plan: PlanTier;
  className?: string;
  children: ReactNode;
}

export default function PlanCheckoutButton({ plan, className, children }: Props) {
  const { mutate, isPending } = useCheckout();

  return (
    <button
      type="button"
      onClick={() => mutate(plan)}
      disabled={isPending}
      className={className}
    >
      {isPending ? (
        <span className="flex items-center justify-center gap-2">
          Redirecting
          <Loader2 size={16} className="animate-spin" />
        </span>
      ) : (
        children
      )}
    </button>
  );
}
