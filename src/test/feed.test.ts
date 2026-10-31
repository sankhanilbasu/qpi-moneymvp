import { describe, expect, it } from "vitest";
import { toggledLikes } from "@/lib/sandbox-store";
import { allProducers } from "@/lib/marketplace";
import { emptyWallet } from "@/lib/escrow";

describe("Social feed", () => {
  it("toggling a like adds it once and toggling again removes it", () => {
    expect(toggledLikes([], "swift")).toEqual(["swift"]);
    expect(toggledLikes(["swift"], "swift")).toEqual([]);
  });
  it("your published storefront appears first in the feed", () => {
    const s = { user: null, threads: [], messages: [], commitments: [], wallet: emptyWallet(), likes: [], storefront: { name: "My Shop", category: "crafts" as const, position: [51.5, -0.1] as [number, number], description: "x" },
      offers: [{ id: "o1", title: "Mug", price: 5, description: "", fulfilment: "pickup" as const, schedule: "Daily", paused: false, createdAt: 0 }] };
    expect(allProducers(s, 0)[0]?.id).toBe("me");
  });
});
