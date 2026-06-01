import { describe, it, expect } from "vitest";
import { RegisterSchema, LoginSchema } from "shared";

describe("auth schemas", () => {
  it("register rejects a short password", () => {
    const r = RegisterSchema.safeParse({
      name: "Tester",
      email: "a@b.com",
      password: "short",
    });
    expect(r.success).toBe(false);
  });

  it("register accepts an >= 8 char password", () => {
    const r = RegisterSchema.safeParse({
      name: "Tester",
      email: "a@b.com",
      password: "longenough8",
    });
    expect(r.success).toBe(true);
  });

  it("login does not gate on password strength (compares the hash)", () => {
    const r = LoginSchema.safeParse({ email: "a@b.com", password: "qqqqqq" });
    expect(r.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const r = LoginSchema.safeParse({ email: "not-an-email", password: "x" });
    expect(r.success).toBe(false);
  });
});
