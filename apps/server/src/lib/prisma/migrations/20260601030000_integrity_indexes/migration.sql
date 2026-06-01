-- Data-integrity guards (partial unique indexes — not expressible in the Prisma
-- schema, so managed here). Applied to the live DB while empty (zero de-dup risk).

-- One active usage period per identity (prevents quota-splitting via duplicate rows).
CREATE UNIQUE INDEX "usage_tracking_user_period_key"
  ON "usage_tracking" ("user_id", "period_start", "period_end")
  WHERE "user_id" IS NOT NULL;
CREATE UNIQUE INDEX "usage_tracking_guest_period_key"
  ON "usage_tracking" ("guest_id", "period_start", "period_end")
  WHERE "guest_id" IS NOT NULL;

-- At most one non-terminal subscription per user.
CREATE UNIQUE INDEX "subscriptions_one_active_per_user"
  ON "subscriptions" ("user_id")
  WHERE "status" IN ('ACTIVE', 'TRIALING', 'PAST_DUE');
