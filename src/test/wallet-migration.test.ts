import { describe, expect, it } from "vitest";
import { migrateSandboxBalance, type SandboxState } from "@/lib/sandbox-store";

const saved: SandboxState = {
  user: { name: "Existing user", email: "existing@example.com", idStatus: "none", onboarded: true },
  storefront: null, offers: [], threads: [], messages: [], commitments: [], likes: [],
  wallet: { balance: 250, holds: { c1: 180 }, ledger: [] },
};

describe("Existing sandbox wallet refresh", () => {
  it("sets an existing logged-in user's balance to exactly ₹50,000", () => {
    expect(migrateSandboxBalance(saved).wallet.balance).toBe(50000);
  });
  it("preserves the existing account and escrow holds", () => {
    const next = migrateSandboxBalance(saved);
    expect(next.user).toEqual(saved.user);
    expect(next.wallet.holds).toEqual({ c1: 180 });
  });
  it("does not reset spending after the one-time refresh", () => {
    const spent = { ...migrateSandboxBalance(saved), wallet: { ...saved.wallet, balance: 49820 } };
    expect(migrateSandboxBalance(spent).wallet.balance).toBe(49820);
  });
});