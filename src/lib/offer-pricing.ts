/** Retail is the existing price field; older offers remain retail-only. */
export interface OfferPricing {
  price: number;
  wholesale?: { price: number; minUnits: number } | undefined;
}

export function pricingError(pricing: OfferPricing): string | undefined {
  if (!Number.isFinite(pricing.price) || pricing.price <= 0) return "Enter a retail price greater than zero.";
  if (!pricing.wholesale) return undefined;
  if (!Number.isFinite(pricing.wholesale.price) || pricing.wholesale.price <= 0) return "Enter a wholesale price greater than zero.";
  if (!Number.isInteger(pricing.wholesale.minUnits) || pricing.wholesale.minUnits < 1) return "Enter a whole-number wholesale minimum of at least 1 unit.";
  return undefined;
}

export function unitPriceForQuantity(pricing: OfferPricing, quantity: number): number {
  const wholesale = pricing.wholesale;
  return wholesale && !pricingError(pricing) && Number.isInteger(quantity) && quantity >= wholesale.minUnits ? wholesale.price : pricing.price;
}