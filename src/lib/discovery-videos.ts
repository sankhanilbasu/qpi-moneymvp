import riverside from "@/assets/videos/riverside-mumbai.mp4.asset.json";
import swift from "@/assets/videos/swift-escooter.mp4.asset.json";
import northline from "@/assets/videos/northline-innova.mp4.asset.json";
import studio from "@/assets/videos/studio-mumbai.mp4.asset.json";
import clay from "@/assets/videos/clay-mumbai.mp4.asset.json";
import copperleaf from "@/assets/videos/copperleaf-mumbai.mp4.asset.json";
import atlas from "@/assets/videos/atlas-mumbai.mp4.asset.json";
import yoga from "@/assets/videos/yoga.mp4.asset.json";
import salon from "@/assets/videos/salon.mp4.asset.json";
import therapy from "@/assets/videos/therapy.mp4.asset.json";
import trainer from "@/assets/videos/trainer.mp4.asset.json";
import guitar from "@/assets/videos/guitar.mp4.asset.json";
import florist from "@/assets/videos/florist.mp4.asset.json";

/** AI-generated 5s storefront clips for demo listings (illustrative, not real footage). */
export const discoveryVideos: Record<string, string> = Object.fromEntries(
  Object.entries({ riverside, swift, northline, studio, clay, copperleaf, atlas, yoga, salon, therapy, trainer, guitar, florist }).map(([k, v]) => [k, v.url]),
);
