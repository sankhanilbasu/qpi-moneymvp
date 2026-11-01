import { describe, expect, it } from "vitest";
import { pricingError, unitPriceForQuantity } from "@/lib/offer-pricing";
import { allProducers } from "@/lib/marketplace";
import { actOnCommitment, clearSandbox, createUser, getState, proposeCommitment, saveOffer, saveStorefront } from "@/lib/sandbox-store";

const pricing = { price: 200, wholesale: { price: 150, minUnits: 10 } };

describe("Retail and wholesale unit pricing", () => {
  it("keeps legacy offers retail-only for any quantity", () => expect(unitPriceForQuantity({ price: 200 }, 100)).toBe(200));
  it("uses retail below the wholesale threshold", () => expect(unitPriceForQuantity(pricing, 9)).toBe(200));
  it("uses wholesale at the threshold", () => expect(unitPriceForQuantity(pricing, 10)).toBe(150));
  it("uses wholesale above the threshold", () => expect(unitPriceForQuantity(pricing, 11)).toBe(150));
  it("returns to retail when the quantity drops below the threshold", () => {
    expect(unitPriceForQuantity(pricing, 10)).toBe(150);
    expect(unitPriceForQuantity(pricing, 1)).toBe(200);
  });
  it("requires a positive finite retail price", () => {
    expect(pricingError({ price: 0 })).toBeDefined();
    expect(pricingError({ price: Infinity })).toBeDefined();
  });
  it("requires a positive finite wholesale price", () => {
    expect(pricingError({ ...pricing, wholesale: { price: 0, minUnits: 10 } })).toBeDefined();
    expect(pricingError({ ...pricing, wholesale: { price: NaN, minUnits: 10 } })).toBeDefined();
  });
  it("requires a positive whole-unit threshold", () => {
    for (const minUnits of [0, -1, 1.5, Infinity]) expect(pricingError({ ...pricing, wholesale: { price: 150, minUnits } })).toBeDefined();
    expect(pricingError(pricing)).toBeUndefined();
  });
  it("persists pricing, exposes it to shoppers and holds the wholesale total on acceptance", () => {
    clearSandbox();
    createUser("Pricing Test", "pricing@example.test");
    saveStorefront({ name: "Test kitchen", category: "kitchen", position: [19.06, 72.836], description: "Fresh meals" });
    saveOffer({ ...pricing, id: "priced", title: "Meal", description: "Lunch", fulfilment: "pickup", schedule: "Monday", paused: false, createdAt: 1 });
    const offer = allProducers(getState(), 1)[0]?.offers[0];
    expect(offer?.wholesale).toEqual({ price: 150, minUnits: 10 });
    expect(JSON.parse(localStorage.getItem("qpi.sandbox.v1") ?? "{}").offers[0].wholesale).toEqual({ price: 150, minUnits: 10 });
    if (!offer) throw new Error("Missing published offer");
    const id = proposeCommitment({ threadId: "t", producerId: "me", sellerName: "Test kitchen", item: offer.name, quantity: 10, unitPrice: unitPriceForQuantity(offer, 10), scheduledFor: 2, fulfilment: "pickup" });
    actOnCommitment(id, { type: "accept" });
    expect(getState().commitments[0]?.total).toBe(1500);
    expect(getState().wallet.balance).toBe(48500);
    saveOffer({ ...getState().offers[0], ...pricing, id: "priced", title: "Meal", description: "Lunch", fulfilment: "pickup", schedule: "Monday", paused: false, createdAt: 1, wholesale: undefined });
    expect(allProducers(getState(), 1)[0]?.offers[0]?.wholesale).toBeUndefined();
    clearSandbox();
  });
});