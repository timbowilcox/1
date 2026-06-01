-- Stripe webhook idempotency: record each processed event id once.
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- NOTE (deferred, apply with care against live data): partial unique indexes to
-- harden quota/subscription integrity. These require de-duplicating existing
-- rows first, so they are applied in a supervised migration, not here:
--   * UNIQUE (user_id, period_start, period_end) WHERE user_id IS NOT NULL  on usage_tracking
--   * UNIQUE (guest_id, period_start, period_end) WHERE guest_id IS NOT NULL on usage_tracking
--   * UNIQUE (user_id) WHERE status IN ('ACTIVE','TRIALING','PAST_DUE')      on subscriptions
