import { formatPrice } from "@/lib/discovery";
import type { OfferPricing } from "@/lib/offer-pricing";

export function OfferPrice({ offer }: { offer: OfferPricing }) {
  return <span className="inline-flex flex-col text-xs">
    <span className="font-semibold text-primary">{formatPrice(offer.price)}{offer.wholesale ? " / unit · Retail" : ""}</span>
    {offer.wholesale && <span className="text-muted-foreground">{formatPrice(offer.wholesale.price)} / unit · Wholesale, {offer.wholesale.minUnits}+ units</span>}
  </span>;
}