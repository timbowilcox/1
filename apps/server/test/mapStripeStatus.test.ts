import { describe, it, expect } from "vitest";
import { mapStripeStatus } from "../src/utils/mapStripeStatus.util";

describe("mapStripeStatus", () => {
  it("maps known Stripe statuses to DB enum values", () => {
    expect(mapStripeStatus("active")).toBe("ACTIVE");
    expect(mapStripeStatus("past_due")).toBe("PAST_DUE");
    expect(mapStripeStatus("canceled")).toBe("CANCELED");
    expect(mapStripeStatus("trialing")).toBe("TRIALING");
    expect(mapStripeStatus("unpaid")).toBe("UNPAID");
  });

  it("throws on an unknown status rather than mismapping", () => {
    expect(() => mapStripeStatus("bogus" as never)).toThrow();
  });
});
