import riverside from "@/assets/videos/riverside.mp4.asset.json";
import swift from "@/assets/videos/swift.mp4.asset.json";
import northline from "@/assets/videos/northline-innova.mp4.asset.json";
import studio from "@/assets/videos/studio.mp4.asset.json";
import clay from "@/assets/videos/clay.mp4.asset.json";
import copperleaf from "@/assets/videos/copperleaf.mp4.asset.json";
import atlas from "@/assets/videos/atlas.mp4.asset.json";

/** AI-generated 5s storefront clips for demo listings (illustrative, not real footage). */
export const discoveryVideos: Record<string, string> = Object.fromEntries(
  Object.entries({ riverside, swift, northline, studio, clay, copperleaf, atlas }).map(([k, v]) => [k, v.url]),
);
