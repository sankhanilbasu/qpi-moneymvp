import { describe, expect, it } from "vitest";
import { categories, discoveryProducers, filterProducers } from "@/lib/discovery";

describe("Spatial discovery selection source", () => {
  it("category filtering returns the same eligible producers for stories and pins", () => {
    expect(filterProducers(discoveryProducers, "courier", "").map(p => p.id)).toEqual(["swift", "atlas"]);
    expect(filterProducers(discoveryProducers, "music", "").map(p => p.id)).toEqual(["studio"]);
  });
  it("searches available offers without ignoring the selected category", () => {
    expect(filterProducers(discoveryProducers, "all", "  KEYBOARD ").map(p => p.id)).toEqual(["studio"]);
    expect(filterProducers(discoveryProducers, "courier", "keyboard")).toEqual([]);
  });
  it("every producer has a category marker and at least one offer", () => {
    expect(discoveryProducers.every(p => categories.some(c => c.id === p.category) && p.offers.length > 0)).toBe(true);
  });
});